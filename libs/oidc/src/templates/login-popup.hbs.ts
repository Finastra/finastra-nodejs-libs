export const loginPopupTemplate = `<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimal-ui" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta http-equiv="content-language" content="en" />

    <style type="text/css">
        body {
            height: 100vh;
            margin: 0;
            background-color: #CECECE;
        }
    </style>
</head>

<body>
    <h3 id="message"></h3>
    <script type="text/javascript">
        var pop = window.open("{{{sso_url}}}", "Login Page", "height=640, width=480");
        // failed to open the popup
        if (!pop) {
            var message = document.getElementById("message");
            message.innerText = "🚫 Failed to open the Pop-up, please make sure to allow them and reload!";
        } else {
            var timer = setInterval(function () {
                if (pop.closed) {
                    clearInterval(timer);
                    window.location.replace("{{{redirect_url}}}");
                }
            }, 1000);
        }
    </script>
</body>

</html>`;
