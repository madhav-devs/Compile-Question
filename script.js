
const compileButton = document.getElementById("compile");
const codeInput = document.getElementById("code");
const language = document.getElementById("language");
const output = document.getElementById("output");

let interval;

compileButton.addEventListener("click", function () {
    const code = codeInput.value;
    const langId = language.value;

    if (!code.trim()) {
        output.textContent = "Please enter some code.";
        return;
    }

    clearInterval(interval);
    compileButton.disabled = true;
    output.textContent = "Compiling...";

    fetch("https://codequotient.com/api/executeCode", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            code: code,
            langId: langId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            output.textContent = data.error;
            compileButton.disabled = false;
            return;
        }

        const codeId = data.codeId;

        if (!codeId) {
            output.textContent = "Code submission failed.";
            compileButton.disabled = false;
            return;
        }

        output.textContent = "Code submitted. Waiting for result...";

        interval = setInterval(function () {
            fetch("https://codequotient.com/api/codeResult/" + codeId)
                .then(response => response.json())
                .then(result => {
                    if (result.data && Object.keys(result.data).length > 0) {
                        clearInterval(interval);

                        if (result.data.errors && result.data.errors.trim()) {
                            output.textContent = result.data.errors;
                        } else {
                            output.textContent = result.data.output || "No output";
                        }

                        compileButton.disabled = false;
                    }
                })
                .catch(error => {
                    clearInterval(interval);
                    output.textContent = error.message;
                    compileButton.disabled = false;
                });
        }, 2000);
    })
    .catch(error => {
        output.textContent = error.message;
        compileButton.disabled = false;
    });
});
