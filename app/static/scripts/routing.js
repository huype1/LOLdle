function login_page() {
    location.href = "/login";
}

function logout_page() {
    localStorage.clear();
    sessionStorage.clear();
    location.href = "/logout";
}

function stats_page(){
    location.href ="/stats";
}
function add_champion() {
    sessionStorage.clear();
    location.href = "/champion";
}