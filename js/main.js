import helper from "../services/helper.js";
import * as ultils from "../services/ultils.js";

// Auth Modal Functionality
document.addEventListener("DOMContentLoaded", function () {
    // Get DOM elements
    const signupBtn = document.querySelector(".signup-btn");
    const loginBtn = document.querySelector(".login-btn");
    const bannerBtn = document.querySelector(".banner-button");
    const sidebarNoLoginBtns = document.querySelectorAll(".sidebar-no-login-btn");
    const sidbarCreateBtn = document.querySelector(".create-btn");

    // Wrapper of Login modal and Signup modal
    const authModal = document.getElementById("authModal"); 
    const modalClose = document.getElementById("modalClose");
    const signupForm = document.getElementById("signupForm");
    const loginForm = document.getElementById("loginForm");
    const showLoginBtn = document.getElementById("showLogin");
    const showSignupBtn = document.getElementById("showSignup");

    // Function to show signup form
    function showSignupForm() {
        signupForm.style.display = "block";
        loginForm.style.display = "none";
        const result = ultils.signup();
        if(result){
            loginForm.querySelector('.auth-form-content').reset();
            closeModal();
        }
    }

    // Function to show login form
    function showLoginForm() {
        signupForm.style.display = "none";
        loginForm.style.display = "block";
        const result = ultils.login();
        if(result){
            loginForm.querySelector('.auth-form-content').reset();
            closeModal();
        }
    }

    // Function to open modal
    function openModal() {
        authModal.classList.add("show");
        document.body.style.overflow = "hidden"; // Prevent background scrolling
    }

    // Open modal with Sign Up form when clicking Sign Up button
    signupBtn.addEventListener("click", function () {
        showSignupForm();
        openModal();
    });

    // Open modal with Login form when clicking Login button
    loginBtn.addEventListener("click", function () {
        showLoginForm();
        openModal();
    });

    // Close modal function
    function closeModal() {
        authModal.classList.remove("show");
        document.body.style.overflow = "auto"; // Restore scrolling
    }

    // Close modal when clicking close button
    modalClose.addEventListener("click", closeModal);

    // Close modal when clicking overlay (outside modal container)
    authModal.addEventListener("click", function (e) {
        if (e.target === authModal) {
            closeModal();
        }
    });

    // Close modal with Escape key
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && authModal.classList.contains("show")) {
            closeModal();
        }
    });

    // Switch to Login form
    showLoginBtn.addEventListener("click", function () {
        showLoginForm();
    });

    // Switch to Signup form
    showSignupBtn.addEventListener("click", function () {
        showSignupForm();
    });

    bannerBtn.addEventListener("click", function(e){
        showSignupForm();
        openModal();
    })
    sidebarNoLoginBtns.forEach(btn => {
        btn.addEventListener("click", function(){
            showLoginForm();
            openModal();
        })
    })
    sidbarCreateBtn.addEventListener("click", function(){
        const currentUser = JSON.parse(localStorage.getItem("user"))?.user
        if(!currentUser){
            showLoginForm();
            openModal();
        }
    })

    document.addEventListener("contextmenu", function(e){
        e.preventDefault();
    })
});

// User Menu Dropdown Functionality
document.addEventListener("DOMContentLoaded", function () {
    const userAvatar = document.getElementById("userAvatar");
    const userDropdown = document.getElementById("userDropdown");
    const logoutBtn = document.getElementById("logoutBtn");

    document.getElementById("profileBtn").addEventListener("click", function(){
        userDropdown.classList.remove("show");
        document.getElementById("userModal").classList.toggle("show");
        ultils.showUpdateUserProfile();
    })

    // Toggle dropdown when clicking avatar
    userAvatar.addEventListener("click", function (e) {
        e.stopPropagation();
        userDropdown.classList.toggle("show");
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
        if (
            !userAvatar.contains(e.target) &&
            !userDropdown.contains(e.target)
        ) {
            userDropdown.classList.remove("show");
        }
    });

    // Close dropdown when pressing Escape
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && userDropdown.classList.contains("show")) {
            userDropdown.classList.remove("show");
        }
    });

    // Handle logout button click
    logoutBtn.addEventListener("click", function () {
        // Close dropdown first
        userDropdown.classList.remove("show");
        ultils.logout();
    });
});

// Other functionality
document.addEventListener("DOMContentLoaded", async function () {
    const trendingTracks = await helper.getTrendingTracks();
    const trendingArtists = await helper.getTrendingArtists();
    const trendingPlaylists = await helper.getPlaylists();
    
    // Check user info for Header, Footer
    await ultils.getHeaderActions();
    await ultils.getSidebarActions();
    await ultils.getFooterActions(trendingTracks.tracks[0]);
    await ultils.showHomeSections(trendingTracks.tracks, trendingArtists.artists, trendingPlaylists.playlists);

    const player = document.querySelector(".player");
    // Make player focusable
    player.setAttribute("tabindex", "0"); 

    player.addEventListener("keyup", function(event) {
        ultils.manipulateKeyUp(event);
    });

    // Optionally, focus the player when clicked
    player.addEventListener("click", function() {
        player.focus();
    });
});
