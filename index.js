const express = require("express");
const speakeasy = require("speakeasy");
const http = require("http");
const bcrypt = require("bcrypt");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const server = http.createServer(app);
const { JsonDB, Config } = require("node-json-db");
const QRCode = require("qrcode");
var db = new JsonDB(new Config("myDataBase", true, false, "/"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "./")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./index.html"));
});

async function getDataFromDatabase(email) {
  try {
    let path = `/${email}`;
    const data = await db.getData(path);
    return data;
  } catch (err) {
    console.log("Path does not exist");
    return false;
  }
}

function getEnteredTOTP(
  input1Value,
  input2Value,
  input3Value,
  input4Value,
  input5Value,
  input6Value
) {
  var totp =
    input1Value +
    input2Value +
    input3Value +
    input4Value +
    input5Value +
    input6Value;
  return totp;
}

app.post("/register", async (req, res) => {
  try {
    const foundUser = await getDataFromDatabase(req.body.email);
    console.log(foundUser);
    if (!foundUser) {
      let hashPassword = await bcrypt.hash(req.body.password, 10);
      const temp_secret = speakeasy.generateSecret();
      const id = Date.now();
      const username = req.body.username;
      const email = req.body.email;
      const password = hashPassword;
      const path = `/${email}`;
      db.push(path, {
        id: id,
        username: username,
        email: email,
        password: password,
        secret: temp_secret,
      });
      let qr_code;
      QRCode.toDataURL(temp_secret.otpauth_url, function (err, data) {
        console.log(data);
        res.send(
          `
        <html lang="en">
          <head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
              charset="utf-8"
            />
            <title>QR Code Saver</title>
            <link rel="stylesheet" href="./OTPPage.css" />
            <link
              rel="stylesheet"
              href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css"
              integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
              crossorigin="anonymous"
            />
          </head>
          <body class="container-fluid bg-body-tertiary d-block">
            <div class="row justify-content-center">
              <div class="col-12 col-md-6 col-lg-4" style="min-width: 500px">
                <div
                  class="card bg-white mb-5 mt-5 border-0"
                  style="box-shadow: 0 12px 15px rgba(00, 0, 0.02)"
                >
                  <div class="card-body p-5 text-center">
                    <h4>2FA QR</h4>
                    <p>Scan the QR Code using Authenticator App</p>
                      <div class="qr-field mb-4">
                        <img src="${data}" alt="QR Code"/><br>
                      <button
                        class="btn btn-primary mb-3"
                        title="Submit"
                        type="submit"
                        id="submitButton"
                        onclick="location.href='./LoginPage.html'"
                      >
                        Move to Login
                      </button>
                  </div>
                  <p class="reset text-muted mb-0">
              Save the Details <b>It won't be available again</b>
            </p>
                </div>
              </div>
            </div>
        
            <div class="footer">
              Made with ❤️| Visit
              <a
                href="https://github.com/absolute-viper/2_FA_Authentication"
                rel="noopener noreferrer"
                target="_blank"
                >Github</a
              >
            </div>
          </body>
        </html>
        `
        );
      });
    } else {
      res.send(
        `
        <html lang="en">
          <head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
              charset="utf-8"
            />
            <title>QR Code Saver</title>
            <link rel="stylesheet" href="./OTPPage.css" />
            <link
              rel="stylesheet"
              href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css"
              integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
              crossorigin="anonymous"
            />
          </head>
          <body class="container-fluid bg-body-tertiary d-block">
            <div class="row justify-content-center">
              <div class="col-12 col-md-6 col-lg-4" style="min-width: 500px">
                <div
                  class="card bg-white mb-5 mt-5 border-0"
                  style="box-shadow: 0 12px 15px rgba(00, 0, 0.02)"
                >
                  <div class="card-body p-5 text-center">
                    <h4>Email Already Registered</h4>
                      <button
                        class="btn btn-primary mb-3"
                        title="Submit"
                        type="submit"
                        id="submitButton"
                        onclick="location.href='./LoginPage.html'"
                      >
                        Move to Login
                      </button>
                  </div>
                </div>
              </div>
            </div>
        
            <div class="footer">
              Made with ❤️| Visit
              <a
                href="https://github.com/absolute-viper/2_FA_Authentication"
                rel="noopener noreferrer"
                target="_blank"
                >Github</a
              >
            </div>
          </body>
        </html>
        `
      );
    }
  } catch (error) {
    res.send("Internal server error");
    console.log(error);
  }
});

const wrong_credentials = `
<html lang="en">
  <head>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
      charset="utf-8"
    />
    <title>QR Code Saver</title>
    <link rel="stylesheet" href="./OTPPage.css" />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css"
      integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
      crossorigin="anonymous"
    />
  </head>
  <body class="container-fluid bg-body-tertiary d-block">
    <div class="row justify-content-center">
      <div class="col-12 col-md-6 col-lg-4" style="min-width: 500px">
        <div
          class="card bg-white mb-5 mt-5 border-0"
          style="box-shadow: 0 12px 15px rgba(00, 0, 0.02)"
        >
          <div class="card-body p-5 text-center">
            <h4>Invalid Email or Password</h4>
              <button
                class="btn btn-primary mb-3"
                title="Submit"
                type="submit"
                id="submitButton"
                onclick="location.href='./LoginPage.html'"
              >
                Retry
              </button>
              <button
                class="btn btn-primary mb-3"
                title="Submit"
                type="submit"
                id="submitButton"
                onclick="location.href='./RegistrationPage.html'"
              >
                Signup
              </button>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      Made with ❤️| Visit
      <a
        href="https://github.com/absolute-viper/2_FA_Authentication"
        rel="noopener noreferrer"
        target="_blank"
        >Github</a
      >
    </div>
  </body>
</html>
`;

var current_user_email = "";
app.post("/login", async (req, res) => {
  try {
    const foundUser = await getDataFromDatabase(req.body.email);
    current_user_email = foundUser.email;
    console.log(foundUser.email);
    if (foundUser) {
      let submittedPass = req.body.password;
      const password = foundUser.password;
      console.log(submittedPass, password);
      const passwordMatch = await bcrypt.compare(submittedPass, password);
      if (passwordMatch) {
        let usrname = foundUser.username;
        res.sendFile(path.join(__dirname, "./OTPPage.html"));
      } else {
        res.send(wrong_credentials);
      }
    } else {
      let fakePass = `$2b$$10$ifgfgfgfgfgfgfggfgfgfggggfgfgfga`;
      await bcrypt.compare(req.body.password, fakePass);

      res.send(wrong_credentials);
    }
  } catch (error) {
    res.send("Internal server error");
    console.log(error);
  }
});

const wrong_TOTP = `
<html lang="en">
  <head>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
      charset="utf-8"
    />
    <title>QR Code Saver</title>
    <link rel="stylesheet" href="./OTPPage.css" />
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css"
      integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
      crossorigin="anonymous"
    />
  </head>
  <body class="container-fluid bg-body-tertiary d-block">
    <div class="row justify-content-center">
      <div class="col-12 col-md-6 col-lg-4" style="min-width: 500px">
        <div
          class="card bg-white mb-5 mt-5 border-0"
          style="box-shadow: 0 12px 15px rgba(00, 0, 0.02)"
        >
          <div class="card-body p-5 text-center">
            <h4>Wrong TOTP Enter Again</h4>
              <button
                class="btn btn-primary mb-3"
                title="Submit"
                type="submit"
                id="submitButton"
                onclick="location.href='./OTPPage.html'"
              >
                Retry
              </button>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      Made with ❤️| Visit
      <a
        href="https://github.com/absolute-viper/2_FA_Authentication"
        rel="noopener noreferrer"
        target="_blank"
        >Github</a
      >
    </div>
  </body>
</html>
`;

app.post("/verification", async (req, res) => {
  try {
    const foundUser = await getDataFromDatabase(current_user_email);
    console.log(foundUser.email);
    let i1 = req.body.input1;
    let i2 = req.body.input2;
    let i3 = req.body.input3;
    let i4 = req.body.input4;
    let i5 = req.body.input5;
    let i6 = req.body.input6;
    if (foundUser) {
      var user_token = getEnteredTOTP(i1, i2, i3, i4, i5, i6);
      console.log(user_token);
      var base32secret = foundUser.secret.base32;
      console.log(base32secret);
      var TOTP_match = speakeasy.totp.verify({
        secret: base32secret,
        encoding: "base32",
        token: user_token,
      });
      if (TOTP_match) {
        res.sendFile(path.join(__dirname, "./Landing.html"));
      } else {
        res.send(wrong_TOTP);
      }
    } else {
      res.send(wrong_TOTP);
    }
  } catch (error) {
    res.send("Internal server error");
    console.log(error);
  }
});

server.listen(5000, function () {
  console.log("server is listening on port: 5000");
});
