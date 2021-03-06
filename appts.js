import email from "./email/src/Email";
import apptAgreement from "./page-objects/appointment-agreement";
import { getApptDetails } from "./formatter/get-appt-info";
import _ from "lodash";
import cheerio from "cheerio";
import fetch from "node-fetch";
import { renderEmail } from "react-html-email";
import mom from "moment";
import { extendMoment } from "moment-range";
import knex from "./data/index";
import mailgun from "./mailgun";

const moment = extendMoment(mom);

/**
 * checks if a given appoinment date is within 7 days of a user registration date
 * @param data
 * @param userRegisterDate
 * @returns {*}
 */
export function isApptAvailableInTheNext7Days(data, userRegisterDate) {
  const appointmentAvaliableDateString = data.text;
  const userCreationDate = moment(userRegisterDate);
  const sevenDaysFromNow = moment(userRegisterDate).add(7, "days");
  const range = moment.range(userCreationDate, sevenDaysFromNow);
  const appointmentDate = moment(
    appointmentAvaliableDateString,
    "DD MMMM YYYY",
    "de"
  );
  if (!appointmentDate.isValid()) {
    console.error(appointmentAvaliableDateString);
    throw new Error(`INVALID_DATE: ${appointmentAvaliableDateString}`);
  }
  return range.contains(appointmentDate);
}

export function getBookableAppointments($) {
  return $(apptAgreement.appointmentTable).find(apptAgreement.bookableAppt);
}

function getEmailsRegisteredInLast7Days() {
  return knex("users")
    .whereBetween("created_at", [
      moment()
        .subtract(7, "days")
        .format("YYYY-MM-DD"),
      moment().format("YYYY-MM-DD")
    ])
    .select("*");
}

function checkForAppts() {
  return fetch(apptAgreement.url)
    .then(response => {
      if (!response.ok) {
        return response
          .text()
          .then(data => {
            throw new Error({
              err: "BAD RESPONSE",
              status: response.status,
              nessage: data
            });
          })
          .catch(err => {
            console.error(err);
          });
      }
      return response.text();
    })
    .then(html => {
      const $ = cheerio.load(html);

      const appts = getBookableAppointments($);
      const apptLinks = appts
        .map(_.partialRight(getApptDetails, $))
        .toArray()
        .filter(data => isApptAvailableInTheNext7Days(data));

      getEmailsRegisteredInLast7Days()
        .then(users => {
          if (!users) {
            throw new Error("No users");
          }
          return users;
        })

        .then(users => {
          const processedUsers = users
            // filter out the users that won't have any appointments
            .map(user => ({
              ...user,
              appointments: apptLinks.filter(apptLink =>
                isApptAvailableInTheNext7Days(apptLink, user.created_at)
              )
            }))
            // remove users with 0 appointments
            .filter(user => user.appointments.length);

          if (!processedUsers.length) {
            console.debug("No appointments found for user");
          }

          processedUsers.forEach(sendEmail);
        });
    })
    .catch(console.error);
}

function sendEmail(user) {
  console.log("sending email to " + user.email);

  const data = {
    from: "Terminator Berlin <no-reply@not-a-valid-domain.com>",
    to: user.email,
    subject: "An appointment to Anmeld has been found!",
    html: renderEmail(email({ emailLinks: user.appointments })),
    "o:tag": "terminator-alpha"
  };

  mailgun.messages().send(data, function(error, body) {
    if (error) {
      console.error(error);
    } else {
      console.debug(
        `Mail successfully send to user ${
          user.email
        } for appointments ${JSON.stringify(user.appointments)}`
      );
    }
  });
}

checkForAppts();
(function loop() {
  const rand = Math.round(Math.random() * (3000000 - 15000) + 15000);
  console.log(
    "next check scheduled for",
    Math.round(rand / 1000 / 60),
    "minutes"
  );
  setTimeout(function() {
    checkForAppts();
    loop();
  }, rand);
})();
