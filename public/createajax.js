// Function to display results
const displayResults = (result) => {
    const divElement = document.getElementById("output");
    // Reset output at each call
    divElement.innerHTML = "";
    if (result.trans === "Error") {
        divElement.innerHTML += `
        <h2>Error creating new customer</h2><br>
        <p>${result.result}</p>
        `
    } else {
        divElement.innerHTML += `
        <h2>New Customer Created!</h2>
        `
    };
};

// Handle form submission
document.querySelector("form").addEventListener("submit", e => {
    // Cancel default behavior of sending a synchronous POST request
    e.preventDefault();
    // Create a FormData object, passing the form as a parameter
    const formData = new FormData(e.target);
    fetch("/create", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        displayResults(result);
    })
    .catch(err => {
        console.error(err.message);
    });
    return;
});