exports.getFrontPage = (req,res, next) => {
    res.redirect("/user");
}

exports.getLogin = (req,res, next) => {
    res.render("auth/login",{
        pageTitle: "Login Page",
        path: "/login"
    })
}

exports.postLogin = (req,res, next) => {
    res.send("Into the PostLogin route.");
}

exports.getSignup = (req,res, next) => {
    res.render("auth/signup",{
        pageTitle: "SignUp page",
        path: "/signup"
    });
}

exports.postSignup = (req,res, next) => {
    res.send("Into the PostSignUp route.");
}