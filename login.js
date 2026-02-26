const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", function(){

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // SIMPLE DEMO LOGIN
    if(username === "pragna" && password === "1234"){

        // store login state
        localStorage.setItem("isLoggedIn","true");
        localStorage.setItem("user", username);

        // open dashboard
        window.location.href = "index.html";
    }
    else{
        alert("Invalid login details");
    }
});
