import helper from "./helper.js";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const $$$ = document.getElementById.bind(document);

// StateHolder for all Apps
const stateHolder = {
    token: await checkValidToken(),
    currentAudio: new Audio(),
    readyToPlayTracks: [],
    albumState: false,
    toggleArrange: false,
    _repeatState: 0,
    _shuffleState: false,
    _next: 1,
    _prev: -1,
    _randomImg: "https://chrt.org/wp-content/uploads/2023/03/shutterstock_2220431045-300x300.jpg",
    _validImageTypes: ['jpeg', 'png', 'gif', 'bmp', 'webp', "jpg"],
}

// Signup Function
export function signup(){
    const signupUsername = $$$('signupUsername');
    const signupDisplayname = $$$('signupDisplayname');
    const signupEmail = $$$('signupEmail');
    const signupPassword = $$$('signupPassword');
    const signupConfirmPassword = $$$('signupConfirmPassword');
    const signupCountry = $$$('country-select');
    
    let username = "";
    let displayName = '';
    let email = '';
    let password = '';
    let confirmPassword = '';
    let isUsernameValid = false;
    let isDisplaynameValid = false;
    let isEmailValid = false;
    let isPasswValid = false;
    let isConfirmPasswValid = false;

    // Verify fields
    signupUsername.addEventListener("input", function() {
        username = escapeHtml(this.value);
    })
    signupUsername.addEventListener("focusout", function() {
        if(!username.trim()){
            forminputNotification(signupUsername, "Please enter Username!");
            isUsernameValid = false;
        } else if(username.length > 16){
            forminputNotification(signupUsername, "Username maximun length is 16 characters!");
            isUsernameValid = false;
        } else {
            forminputRemoveNotification(signupUsername);
            isUsernameValid = true;
        };
    });

    signupDisplayname.addEventListener("input", function() {
        displayName = escapeHtml(this.value);
    })
    signupDisplayname.addEventListener("focusout", function(){
        if(!displayName.trim()){
            forminputNotification(signupDisplayname, "Please enter Displayname!");
            isDisplaynameValid = false;
        }else if(displayName.length > 16){
            forminputNotification(signupDisplayname, "Displayname maximun length is 16 characters!");
            isDisplaynameValid = false;
        } else {
            forminputRemoveNotification(signupDisplayname);
            isDisplaynameValid = true;
        };

    })
    
    signupEmail.addEventListener("input", function() {
        email = escapeHtml(this.value);
    })
    signupEmail.addEventListener("focusout", function(){
        if(!email){
            forminputNotification(signupEmail, "Please enter Email!");
            isEmailValid = false;
        } else if(validateEmail(email) === false){
            forminputNotification(signupEmail, "Wrong format! eg: youremail@gmail.com");
            isEmailValid = false;
        } else {
            forminputRemoveNotification(signupEmail);
            isEmailValid = true;
        }
    })
    
    signupPassword.addEventListener("input", function() {
        password = escapeHtml(this.value);
    })
    signupPassword.addEventListener("focusout", function(){
        const validPassword = validatePassword(password);
        if(!validPassword.isValid){
            forminputNotification(signupPassword, validPassword.message);
            isPasswValid = false;
        } else {
            forminputRemoveNotification(signupPassword);
            isPasswValid = true;
        }
    })
    
    signupConfirmPassword.addEventListener("input", function() {
        confirmPassword = this.value;
    })
    signupConfirmPassword.addEventListener("focusout", function(){
        const validPassword = validatePassword(confirmPassword);
        if(!validPassword.isValid){
            forminputNotification(signupConfirmPassword, validPassword.message);
            isConfirmPasswValid = false;
        } else {
            if(password !== confirmPassword){
                forminputNotification(signupConfirmPassword, "Confirm password and password is mismatch!");
                isConfirmPasswValid = false;
            } else {
                forminputRemoveNotification(signupConfirmPassword);
                isConfirmPasswValid = true;
            }
        }

    })

    signupForm.addEventListener('submit', async function(e){
        e.preventDefault();

        if(isUsernameValid && isDisplaynameValid && isEmailValid && isPasswValid && isConfirmPasswValid){
            try {
                const signupInfo = await {
                    username: username,
                    email: email,
                    password: password,
                    display_name: displayName,
                    bio: "Test bio",
                    country: signupCountry.value
                }
                await helper.register('auth/register', signupInfo);
                signupForm.querySelector(".auth-form-content").reset();

                //Login right after Register
                const loginInfo = await {
                    email: email,
                    password: password,
                }
                const loginResult = await helper.login('auth/login', loginInfo);
                const popularTracks = await helper.getTrendingTracks();
                localStorage.setItem('user', JSON.stringify({ user: loginResult.user, access_token: loginResult.access_token}));
                stateHolder.token = loginResult.access_token;
                authModal.classList.remove("show");
                // Restore scrolling
                document.body.style.overflow = "auto"; 
                // Reupdate some elements
                await getHeaderActions();
                await getSidebarActions();
                await getFooterActions(popularTracks.tracks[0]);
                toastSnackbar("Success!");
            } catch (error) {
                toastSnackbar(error);
            }
        } else {
            toastSnackbar("Fail to Signup!");
        }
    })

}

// Login Function
export function login(){
    const loginEmail = $$$('loginEmail');
    const loginPassword = $$$('loginPassword');
    let email = '';
    let password = '';
    let isEmailValid = false;
    let isPasswValid = false;

    // Verify fields
    loginEmail.addEventListener("input", function() {
        email = escapeHtml(this.value);
    })
    loginEmail.addEventListener("focusout", function(){
        if(!email){
            forminputNotification(loginEmail, "Please enter Email!");
            isEmailValid = false;
        } else if(validateEmail(email) === false){
            forminputNotification(loginEmail, "Wrong format! eg: youremail@gmail.com");
            isEmailValid = false;
        } else {
            forminputRemoveNotification(loginEmail);
            isEmailValid = true;
        }
    })

    
    loginPassword.addEventListener("input", function() {
        password = escapeHtml(this.value);
    })
    loginPassword.addEventListener("focusout", function(){
        const validPassword = validatePassword(password);
        if(!validPassword.isValid){
            forminputNotification(loginPassword, validPassword.message);
            isPasswValid = false;
        } else {
            forminputRemoveNotification(loginPassword);
            isPasswValid = true;
        }
    })
    
    loginForm.addEventListener('submit', async function(e){
        e.preventDefault();
        if( isEmailValid && isPasswValid){
            try {
                const loginInfo = await {
                    email: email,
                    password: password,
                }
                const result = await helper.login('auth/login', loginInfo);
                toastSnackbar("Success!");
                const popularTracks = await helper.getTrendingTracks();
                await localStorage.setItem('user', JSON.stringify({ user: result.user, access_token: result.access_token}));
                stateHolder.token = result.access_token;
                await authModal.classList.remove("show");
                // Restore scrolling
                document.body.style.overflow = "auto";
                // Reupdate some elements
                await getHeaderActions();
                await getSidebarActions();
                await getFooterActions(popularTracks.tracks[0]);
                loginForm.querySelector(".auth-form-content").reset();
            } catch (error) {
                toastSnackbar(error);
            }
        }else {
            toastSnackbar("Fail to Login!");
        }
    })
}

export function showUpdateUserProfile(){
    const userModal = $$$("userModal");
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const currentUserInfo = currentUser.user;
    const currentUserToken = currentUser.access_token;
    const userForm = $(".user-form-content");
    const userUsername = $$$("userUsername");
    const userDisplayname = $$$("userDisplayname");
    const userEmail = $$$("userEmail");
    const userImgInput = $$$("userImgInput");
    const userImg = userImgInput.parentElement.querySelector('img')
    
    userUsername.value = currentUserInfo?.username ||"";
    userDisplayname.value = currentUserInfo?.display_name ||"";
    userEmail.value = currentUserInfo?.email ||"";
    let username = userUsername.value;
    let displayname = userDisplayname.value;
    let email = userEmail.value;
    let imgSource = currentUserInfo?.avatar_url;
    let isUsernameValid = true;
    let isDisplaynameValid = true;
    let isEmailValid = true;

    userImg.src = imgSource;
    userImg.onerror = () => {
        userImg.src = stateHolder._randomImg;
    }

    const formData = new FormData();
    userImgInput.addEventListener('change', async () => {
        if (userImgInput.files.length > 0) {
            const selectedFile = userImgInput.files[0];
            if (selectedFile) {
                try {
                    formData.append("avatar", selectedFile);
                    const result = await helper.uploadAvatarImg(formData, {token: stateHolder.token});
                    imgSource = `http://spotify.f8team.dev/${result.file.url}`;
                    userImg.src = imgSource;
                    getHeaderActions();
                    toastSnackbar(result.message);
                } catch (error) {
                    toastSnackbar(error);
                }
            }
        }
    });

    userUsername.addEventListener("input", function() {
        username = escapeHtml(this.value);
    })
    userUsername.addEventListener("focusout", function() {
        if(!username.trim()){
            forminputNotification(signupUsername, "Please enter Username!");
            isUsernameValid = false;
        } else if(username.length > 16){
            forminputNotification(signupUsername, "Username maximun length is 16 characters!");
            isUsernameValid = false;
        } else {
            forminputRemoveNotification(signupUsername);
            isUsernameValid = true;
        };
    });

    userDisplayname.addEventListener("input", function() {
        displayname = escapeHtml(this.value);
    })
    userDisplayname.addEventListener("focusout", function(){
        if(!displayname.trim()){
            forminputNotification(userDisplayname, "Please enter Displayname!");
            isDisplaynameValid = false;
        }else if(displayname.length > 16){
            forminputNotification(userDisplayname, "Displayname maximun length is 16 characters!");
            isDisplaynameValid = false;
        } else {
            forminputRemoveNotification(userDisplayname);
            isDisplaynameValid = true;
        };

    })

    userEmail.addEventListener("input", function() {
        email = escapeHtml(this.value);
    })
    userEmail.addEventListener("focusout", function(){
        if(!email){
            forminputNotification(userEmail, "Please enter Email!");
            isEmailValid = false;
        } else if(validateEmail(email) === false){
            forminputNotification(userEmail, "Wrong format! eg: youremail@gmail.com");
            isEmailValid = false;
        } else {
            forminputRemoveNotification(userEmail);
            isEmailValid = true;
        }
    })
    
    userForm.addEventListener('submit', async function(e){
        e.preventDefault();
        if(isUsernameValid && isDisplaynameValid && isEmailValid){
            try {
                const userProfile = await {
                    email: email,
                    username: username,
                    display_name: displayname,
                    avatar_url: imgSource
                }
                const result = await helper.updateProfile(currentUserInfo.id, userProfile, {token: currentUserToken});
                await localStorage.setItem('user', JSON.stringify({ user: result.data, access_token: currentUserToken}));
                stateHolder.token = currentUserToken;
                userModal.classList.remove("show");
                document.body.style.overflow = "auto";
                getHeaderActions()
                toastSnackbar("Success!");
            } catch (error) {
                toastSnackbar(error);
            }
        } else {
            toastSnackbar("Fail to update!");
        }
    })

    // Close btn
    const userModalClose = $$$("userModalClose");
    userModalClose.addEventListener("click", function(){
        userModal.classList.remove("show");
    })
}

// Logout Function
export async function logout(){
    const access_token = await JSON.parse(localStorage.getItem("user"))?.access_token;
    await helper.logout("auth/logout", null, access_token);
    await localStorage.removeItem("user");
    // Reupdate some elements
    await getHeaderActions();
    await getSidebarActions();
    await getFooterActions();
}

function showPlaylistCards(playlists){
    let cards = "";
    playlists.forEach(playlist => {
        cards += `<div class="playlist-card" data-playlist-id="${playlist.id}">
                    <div class="playlist-card-cover">
                        <img
                            src="${playlist.image_url ? playlist.image_url : stateHolder._randomImg}"
                            alt="${playlist.name}"
                            class="playlist-card-cover-child"
                        />
                    </div>
                    <div class="playlist-card-info">
                        <h3 class="playlist-card-name">${playlist.name}</h3>
                        <p class="playlist-card-username">${playlist.user_username}</p>
                        <p class="playlist-card-description">${playlist.description}</p>
                    </div>
                </div>`
    })
    return cards;
}

export function showArtistCards(arrayArtists){
    let cards = '';
    for(let artist of arrayArtists){
        cards += `<div class="artist-card" data-artist-id="${artist.id}">
                    <div class="artist-card-cover">
                        <img
                            src="${artist.image_url}"
                            alt="${artist.name}"
                        />
                        <button class="artist-play-btn">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                    <div class="artist-card-info">
                        <h3 class="artist-card-name">${artist.name}</h3>
                        <p class="artist-card-type">Artist</p>
                    </div>
                </div>`
    }
    return cards;
}
export function showHitCards(arrayHits){
    let cards = '';
    for(let hit of arrayHits){
        const validImageTypes = ['jpeg', 'png', 'gif', 'bmp', 'webp', "jpg"];
        let imgExtension = getFileExtension(hit.image_url);
        
        cards += `<div class="hit-card" data-track-id="${hit.id}">
                    <div class="hit-card-cover">
                        <img
                            src="${validImageTypes.includes(imgExtension) ? hit.image_url : stateHolder._randomImg}"
                            alt="Flowers"
                        />
                        <button class="hit-play-btn">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                    <div class="hit-card-info">
                        <h3 class="hit-card-title">${hit.title}</h3>
                        <p class="hit-card-artist">${hit.artist_name}</p>
                    </div>
                </div>`
    }
    return cards;
}

export async function getHeaderActions(){
    const trendingTracks = await helper.getTrendingTracks();
    const trendingArtists = await helper.getTrendingArtists();
    const trendingPlaylists = await helper.getPlaylists();
    const authBtns = $$(".auth-btn");
    const userMenu = $(".user-menu");
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if(!currentUser){
        authBtns.forEach(btn => {
            Object.assign(btn.style, {"display": "flex"});
        })
        userMenu.style.display = "none";
    } else {
        authBtns.forEach(btn => {
            Object.assign(btn.style, {"display": "none"});
        })
        userMenu.style.display = "flex";
        if(currentUser.user.display_name || currentUser.user.username){
            $(".user-displayname").textContent = currentUser.user.display_name || currentUser.user.username
        } else {
            $(".user-displayname").textContent = currentUser.user.email
        }
        const avtImg = $$$("avtImg");
        avtImg.src = currentUser.user.avatar_url;
        avtImg.onerror = () => avtImg.src = stateHolder._randomImg;
    }

    const searchInput = $(".search-input");
    const allTracks = await helper.getTracks();
    const allArtists = await helper.getArtists();
    const allPlaylists = await helper.getPlaylists();
    searchInput.addEventListener("input", function(e){
        const inputValue = e.target.value;
        if(inputValue.trim().length > 0){
            setTimeout(()=>{
                const newPopularTracks = allTracks.tracks.filter(track => {
                    return track.title.toLowerCase().includes(inputValue.toLowerCase());
                });
                const newArtists = allArtists.artists.filter(artist => {
                    return artist.name.toLowerCase().includes(inputValue.toLowerCase());
                });
                const newPlaylists = allPlaylists.playlists.filter(playlist => {
                    return playlist.name.toLowerCase().includes(inputValue.toLowerCase());
                });
                showHomeSections(newPopularTracks, newArtists, newPlaylists);
            }, 300)
        } else {
            showHomeSections(trendingTracks.tracks, trendingArtists.artists, trendingPlaylists.playlists);
        }
    })
}

export function getSidebarActions(){
    const sidbarCreateBtn = $(".create-btn");
    const navTabs = $(".nav-tabs");
    const searchLibrary = $(".search-library");
    const libraryContent = $(".library-content");
    const sidebarNoLogin = $(".sidebar-no-login");
    
    const currentUser = JSON.parse(localStorage.getItem("user"))?.user
    if(!currentUser){
        navTabs.style.display = "none";
        searchLibrary.style.display = "none";
        libraryContent.style.display = "none";
        sidebarNoLogin.style.display = "flex";
    } else {
        navTabs.style.display = "flex";
        searchLibrary.style.display = "flex";
        libraryContent.style.display = "flex";
        sidebarNoLogin.style.display = "none";
        // Including created playlist, liked tracks, follow artists
        showMyPlaylists();
    }

    sidbarCreateBtn.addEventListener("click", async function(){
        try {
            const data = {
                name: "My New Playlist",
                description: "Playlist description",
                is_public: true,
                image_url: stateHolder._randomImg
            }
            await helper.createPlaylist(data, {token: stateHolder.token})
            showMyPlaylists();
            toastSnackbar("Success!");
        } catch (error) {
            toastSnackbar(error);
        }
    })
    const sortBtn = $(".sort-btn");
    const sortOptions = $(".sort-options");
    sortBtn.addEventListener("click", function(){
        stateHolder.toggleArrange = !stateHolder.toggleArrange;
        if(stateHolder.toggleArrange){
            sortOptions.classList.add("active");
        } else {
            sortOptions.classList.remove("active");
        }
    })
}

async function showMyPlaylists(){
    try {
        const myPlaylists = await helper.getMyPlaylists({token: stateHolder.token})
            .then(results => results.playlists);
        const myFollowedArtists = await helper.getFollowedArtists({token: stateHolder.token})
            .then(resutls => resutls.artists)
            .then(results => {
                results.map(async artist => {
                    try {
                        const result = await helper.getArtistByID(artist.id);
                        artist.is_following = result.is_following;
                        return artist;
                    } catch (error) {
                        toastSnackbar(error);
                    }
                })
                return results;
            });
        const myFollowedPlaylist = await helper.getFollowedPlaylists({token: stateHolder.token})
            .then(results => results.playlists);
            
        showMyPlaylistsElements(myPlaylists, myFollowedArtists, myFollowedPlaylist)
        setFilterOptions(myPlaylists, myFollowedArtists, myFollowedPlaylist);

        const navtabBtns = $$(".nav-tab");
        const navtabPlaylists = $$$("nav-tab-playlists");
        const navtabArtists = $$$("nav-tab-artists");
        navtabPlaylists.addEventListener("click", function(){
            navtabBtns.forEach(navtab => {
                navtab.classList.remove("active");
            });
            this.classList.add("active");
            showMyPlaylistsElements(myPlaylists, null, myFollowedPlaylist)
        })
        navtabArtists.addEventListener("click", function(){
            navtabBtns.forEach(navtab => {
                navtab.classList.remove("active");
            });
            this.classList.add("active");
            const libraryContent = $(".library-content");
            libraryContent.style.display = "flex";
            showMyPlaylistsElements(null, myFollowedArtists, null)
        })

        const searchLibraryInput = $$$("search-library-input");
        const searchLibraryBtn = $(".search-library-btn");
        searchLibraryBtn.addEventListener('click', function(){
            searchLibraryInput.classList.toggle("active");
        })
        searchLibraryInput.addEventListener("input", function(e){
            setTimeout(()=> {
                let myNewPlaylist = myPlaylists.filter(x =>
                    x.name.toLowerCase().includes(e.target.value.toLowerCase())
                );
                let myNewFollowedArtist = myFollowedArtists.filter(x =>
                    x.name.toLowerCase().includes(e.target.value.toLowerCase())
                );
                let myNewFollowedPlaylist = myFollowedPlaylist.filter(x =>
                    x.name.toLowerCase().includes(e.target.value.toLowerCase())
                );
                showMyPlaylistsElements(myNewPlaylist, myNewFollowedArtist, myNewFollowedPlaylist);
            }, 300)
        })
    } catch (error) {
        toastSnackbar(error);
    }
}

function showMyPlaylistsElements(myPlaylist, myFollowedArtists, myFollowedPlaylist){
    const libraryContent = $(".library-content");
    let html = "";
    if(myPlaylist){
        myPlaylist.forEach(playlist => {
            if(!playlist.image_url){
                html += `<div class="library-item default-list"
                                data-playlist-id="${playlist.id}"
                                data-playlist-public="${playlist.is_public}"
                                data-type="myPlaylist">
                            <div class="item-icon liked-songs default-list">
                                <i class="fas fa-heart"></i>
                            </div>
                            <div class="item-info default-list">
                                <div class="item-title default-list">${playlist.name}</div>
                                <div class="item-subtitle default-list">
                                    <i class="fas fa-thumbtack"></i>
                                    Playlist • ${playlist.total_tracks} songs
                                </div>
                                <ul class="item-contextmenu" hidden>
                                    <li class="item-contextmenu-edit">
                                        <i class="fa-solid fa-pencil"></i> Edit
                                    </li>
                                    <li class="item-contextmenu-delete">
                                        <i class="fa-solid fa-trash"></i> Delete
                                    </li>
                                </ul>
                            </div>
                        </div>`
            } else {
                html += `<div class="library-item default-list"
                            data-playlist-id="${playlist.id}"
                            data-playlist-public="${playlist.is_public}"
                            data-type="myPlaylist">
                            <div class="item-image default-list">
                                <img class="item-image-child" src="${playlist.image_url}">
                            </div>
                            <div class="item-info default-list">
                                <div class="item-title default-list">${playlist.name}</div>
                                <div class="item-subtitle default-list">
                                    Playlist • ${playlist.total_tracks} songs
                                </div>
                            </div>
                            <ul class="item-contextmenu">
                                <li class="item-contextmenu-edit">
                                    <i class="fa-solid fa-pencil"></i> Edit
                                </li>
                                <li class="item-contextmenu-delete">
                                    <i class="fa-solid fa-trash"></i> Delete
                                </li>
                            </ul>
                        </div>`
            }
        })
    }
    if(myFollowedArtists){
        myFollowedArtists.forEach(artist => {
            html += `<div class="library-item default-list"
                        data-artist-id="${artist.id}"
                        data-artist-following="${artist.is_following}"
                        data-type="followedArtist">
                        <div class="item-image default-list">
                            <img class="item-image-child" src="${artist.image_url}">
                        </div>
                        <div class="item-info default-list">
                            <div class="item-title default-list">${artist.name}</div>
                            <div class="item-subtitle default-list">
                                ${artist.is_verified ? "Verifired" : ""}
                            </div>
                        </div>
                        <ul class="item-contextmenu">
                            <li class="item-contextmenu-unfollow">
                                Unfollow
                            </li>
                        </ul>
                    </div>`
        })
    }
    if(myFollowedPlaylist){
        myFollowedPlaylist.forEach(playlist => {
            html += `<div class="library-item default-list"
                        data-playlist-id="${playlist.id}"
                        data-playlist-public="${playlist.is_public}"
                        data-type="followedPlaylist">
                        <div class="item-image default-list">
                            <img class="item-image-child" src="${playlist.image_url}">
                        </div>
                        <div class="item-info default-list">
                            <div class="item-title default-list">${playlist.name}</div>
                            <div class="item-subtitle default-list">
                                Playlist • ${playlist.total_tracks} songs
                            </div>
                        </div>
                        <ul class="item-contextmenu">
                            <li class="item-contextmenu-unfollow">
                                Unfollow
                            </li>
                        </ul>
                    </div>`
        })
    }
    libraryContent.innerHTML = html;
    setArrangeOptions();

    const libraryItems = $$(".library-item");
    const allContextMenus = $$(".item-contextmenu");
    libraryItems.forEach(item => {
        if(item.dataset.type === "myPlaylist"){
            const playlistModal = $$$("playlistModal");
            const contextmenuEdit = item.querySelector(".item-contextmenu-edit");
            const contextmenuDelete = item.querySelector(".item-contextmenu-delete");
            const contextMenu = item.querySelector(".item-contextmenu");
            const playlistID = item.dataset.playlistId;
            if(item){
                item.addEventListener("click",  async function(){
                    try {
                        if(contextMenu.classList.contains("active")){
                            contextMenu.classList.remove("active");
                        } else{
                            const trendingTracks = await helper.getTrendingTracks();
                            const trendingArtists = await helper.getTrendingArtists();
                            const trendingPlaylists = await helper.getPlaylists();
                            showPlaylistDetailSection(playlistID, trendingTracks.tracks, trendingArtists.artists, trendingPlaylists.playlists);
                        }
                    } catch (error) {
                        toastSnackbar(error);
                    }
                })
                item.addEventListener('contextmenu', (event) => {
                    event.preventDefault();
                    if(contextMenu.classList.contains("active")){
                        contextMenu.classList.remove("active");
                    } else {
                        allContextMenus.forEach(item => {
                            item.classList.remove("active");
                        })
                        contextMenu.classList.add("active");
                    }
                });
            }
            if(contextMenu){
                if(contextmenuEdit){
                    contextmenuEdit.addEventListener("click",async function(){
                        try {
                            const currentPlaylist = await helper.getPlaylistByID(playlistID, {token: stateHolder.token})
                            playlistModal.classList.add("show");
                            showEditPlaylistDetailForm(currentPlaylist);
                            contextMenu.classList.remove("active");
                        } catch (error) {
                            toastSnackbar(error);
                        }
                    })
                }
                if(contextmenuDelete){
                    contextmenuDelete.addEventListener("click",async function(){
                        try {
                            await helper.deletePlaylist(playlistID, {token: stateHolder.token});
                            await contextMenu.classList.remove("active");
                            showMyPlaylists();
                            toastSnackbar("Success!");
                        } catch (error) {
                            toastSnackbar(`Not found in list`);
                        }
                    })
                }
            }
        }
        if(item.dataset.type === "followedArtist"){
            const contextMenu = item.querySelector(".item-contextmenu");
            const contextmenuUnfollow = item.querySelector(".item-contextmenu-unfollow");
            const artistID = item.dataset?.artistId;
            if(item){
                item.addEventListener("click",  async function(){
                    try {
                        if(contextMenu.classList.contains("active")){
                            contextMenu.classList.remove("active");
                        } else {
                            const trendingTracks = await helper.getTrendingTracks();
                            const trendingArtists = await helper.getTrendingArtists();
                            const trendingPlaylists = await helper.getPlaylists();
                            showArtistDetailSection(artistID, trendingTracks.tracks, trendingArtists.artists, trendingPlaylists.playlists);
                        }
                    } catch (error) {
                        toastSnackbar(error);
                    }
                })
                item.addEventListener('contextmenu', (event) => {
                    event.preventDefault();
                    if(contextMenu.classList.contains("active")){
                        contextMenu.classList.remove("active");
                    } else {
                        allContextMenus.forEach(item => {
                            item.classList.remove("active");
                        })
                        contextMenu.classList.add("active");
                    }
                });
            }
            if(contextmenuUnfollow){
                contextmenuUnfollow.addEventListener("click",async function(){
                    try {
                        await helper.unfollowedArtist(artistID, {token: stateHolder.token});
                        await contextMenu.classList.remove("active");
                        showMyPlaylists();
                        toastSnackbar("Success!");
                    } catch (error) {
                        toastSnackbar(`Not found in list`);
                    }
                })
            }
        }
        if(item.dataset.type === "followedPlaylist"){
            const contextMenu = item.querySelector(".item-contextmenu");
            const contextmenuUnfollow = item.querySelector(".item-contextmenu-unfollow");
            const playlistID = item.dataset.playlistId;
            if(item){
                item.addEventListener("click",  async function(){
                    try {
                        if(contextMenu.classList.contains("active")){
                            contextMenu.classList.remove("active");
                        } else {
                            const trendingTracks = await helper.getTrendingTracks();
                            const trendingArtists = await helper.getTrendingArtists();
                            const trendingPlaylists = await helper.getPlaylists();
                            showPlaylistDetailSection(playlistID, trendingTracks.tracks, trendingArtists.artists, trendingPlaylists.playlists);
                        }
                    } catch (error) {
                        toastSnackbar(error);
                    }
                })
                item.addEventListener('contextmenu', (event) => {
                    event.preventDefault();
                    if(contextMenu.classList.contains("active")){
                        contextMenu.classList.remove("active");
                    } else {
                        allContextMenus.forEach(item => {
                            item.classList.remove("active");
                        })
                        contextMenu.classList.add("active");
                    }
                });
            }
            if(contextmenuUnfollow){
                contextmenuUnfollow.addEventListener("click",async function(){
                    try {
                        await helper.unfollowedPlaylist(playlistID, {token: stateHolder.token});
                        await contextMenu.classList.remove("active");
                        showMyPlaylists();
                        toastSnackbar("Success!");
                    } catch (error) {
                        toastSnackbar(`Not found in list`);
                    }
                })
            }
        }
    })

    const libraryImgs = $$(".item-image-child");
    libraryImgs.forEach(img => {
        img.onerror = () => img.src = stateHolder._randomImg;
    })
}

async function showPlaylistDetailSection(playlistID, popularTracks, artists, playlists) {
    try {
        const playlist = await helper.getPlaylistByID(playlistID,{token: stateHolder.token});
        const currentUser = JSON.parse(localStorage.getItem("user"))
        const getPlaylistTracks = await helper.getPlaylistTracks(playlistID,{token: stateHolder.token});
        const playlistTracks = getPlaylistTracks.tracks;
        let tracksInPlaylist = '';
        playlistTracks.forEach((track, index) => {
            tracksInPlaylist += `<tr class="track-in-list">
                            <td>${index + 1}</td>
                            <td>${track.track_title}</td>
                            <td>${track.artist_name}</td>
                            <td>${Math.floor(track.track_duration/60)}:${(track.track_duration%60).toString().padStart(2,"0")}</td>
                        </tr>`
        })
        if(playlist){
            const contentWrapper = $('.content-wrapper');
            let html = `<div class="playlist-detail-container">
            <div class="playlist-detail-header">`
            if(playlist.image_url){
                html +=`<img src="${playlist.image_url}" alt="${playlist.title}" class="playlist-detail-cover" />`
            } else {
                html += `<div class="playlist-detail-icon">
                            <i class="fas fa-heart"></i>
                        </div>`
            }
            html+= `<div id="playlist-avatar-btn">
                        <i class="fa-solid fa-pencil"></i>
                    </div>
                    <div class="playlist-detail-info">
                        <p>${playlist.is_public === 1 ? "Public Playlist" : "Private Playlist"}</p>
                        <h1 class="playlist-detail-title">${playlist.name}</h1>
                        <p>${playlist.description}</p>
                        <p>${playlist.user_display_name}</p>
                        ${ currentUser && currentUser.user.id !== playlist.user_id 
                            ?  (playlist.is_following 
                                ? '<button class="playlist-detail-unfollow">Unfollow</button>'
                                : '<button class="playlist-detail-follow">Follow</button>')
                            : ""
                        }
                    </div>
                    <div class="playlist-back">
                        <span>⭠</span>
                    </div>
                </div>

                <div class="playlist-detail-tracklist">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tiêu đề</th>
                                <th>Nghệ sĩ</th>
                                <th>Thời lượng</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tracksInPlaylist}
                        </tbody>
                    </table>
                </div>
            </div>`
            contentWrapper.innerHTML = html;

            const playlistDetailImg = $(".playlist-detail-cover")
            if(playlistDetailImg){
                playlistDetailImg.onerror = () => {
                    playlistDetailImg.src = stateHolder._randomImg
                }
            }

            const arrowBack = $(".playlist-back");
            arrowBack.addEventListener('click', function(){
                showHomeSections(popularTracks, artists, playlists);
            })

            $$('.track-in-list').forEach((track, index) => {
                track.addEventListener("click", function(){
                    updatePlayer(playlistTracks[index], stateHolder.currentAudio)
                })
            })

            const playlistModal = $$$("playlistModal");
            const playlistModalClose = $$$("playlistModalClose");
            const playlistAvatarBtn = $$$("playlist-avatar-btn");
            const playlistTitle = $(".playlist-detail-title");
            [playlistAvatarBtn, playlistTitle].forEach(elements => {
                elements.addEventListener("click", function(){
                    playlistModal.classList.add("show");
                    showEditPlaylistDetailForm(playlist);
                })
            })
            playlistModalClose.addEventListener("click", function(){
                playlistModal.classList.remove("show");
            })

            const playlistDetailFollow = $(".playlist-detail-follow");
            if(playlistDetailFollow){
                playlistDetailFollow.addEventListener("click", async function(){
                    try {
                        await helper.followedPlaylist(playlistID, {token: stateHolder.token})
                        getSidebarActions();
                        showPlaylistDetailSection(playlistID, popularTracks, artists, playlists)
                        toastSnackbar("Success!");
                    } catch (error) {
                        toastSnackbar(error);
                    }
                });
            }
            const playlistDetailUnfollow = $(".playlist-detail-unfollow");
            if(playlistDetailUnfollow){
                playlistDetailUnfollow.addEventListener("click", async function(){
                    try {
                        await helper.unfollowedPlaylist(playlistID, {token: stateHolder.token})
                        getSidebarActions();
                        showPlaylistDetailSection(playlistID, popularTracks, artists, playlists)
                        toastSnackbar("Success!");
                    } catch (error) {
                        toastSnackbar(error);
                    }
                });
            }
        }
    } catch (error) {
        toastSnackbar(error);
    }
}

function showEditPlaylistDetailForm(playlist){
    const playlistModal = $$$("playlistModal");
    const playlistFormImg = $$$("playlistFormImg");
    const playlistFormName = $$$("playlistName");
    const playlistFormDescription = $$$("playlistDescription");
    const playlistFormAvatar = $$$("playlist-form-avatar");
    const editPlaylistDetailForm = $(".playlist-modal-form");

    let imgSource = playlist?.image_url;
    playlistFormImg.src = imgSource;
    // When img link is error
    playlistFormImg.onerror = () => {
        playlistFormImg.src = stateHolder._randomImg
    }

    playlistFormName.value = playlist?.name ||"";
    playlistFormDescription.value = playlist?.description ||"";
    
    const formData = new FormData();
    playlistFormAvatar.addEventListener('change', async () => {
        if (playlistFormAvatar.files.length > 0) {
            const selectedFile = playlistFormAvatar.files[0]; 
            if (selectedFile) {
                try {
                    formData.append("cover", selectedFile);
                    const result = await helper.uploadPlaylistCoverImg(playlist.id, formData, {token: stateHolder.token});
                    imgSource = `http://spotify.f8team.dev/${result.file.url}`;
                    playlistFormImg.src = imgSource;
                    // Reupdate some elements
                    getHeaderActions();
                    toastSnackbar(result.message);
                } catch (error) {
                    toastSnackbar(error);
                }
            }
        }
    });

    editPlaylistDetailForm.addEventListener("submit", async function(e){
        e.preventDefault();
        try {
            if(playlistFormName.value.trim() && playlistFormDescription.value.trim()){
                const data = {
                    name: escapeHtml(playlistFormName.value),
                    description: escapeHtml(playlistFormDescription.value),
                    is_public: true,
                    image_url: imgSource
                }
                await helper.updatePlaylist(playlist.id, data, {token: stateHolder.token})
                playlistModal.classList.remove("show");

                // Reupdate some elements
                const trendingTracks = await helper.getTrendingTracks();
                const trendingArtists = await helper.getTrendingArtists();
                const trendingPlaylists = await helper.getPlaylists();
                showMyPlaylists()
                showPlaylistDetailSection(playlist.id, trendingTracks?.tracks, trendingArtists?.artists, trendingPlaylists?.playlists);
                toastSnackbar("Success!");
            }
        } catch (error) {
            toastSnackbar(error);
        }
    })

}

async function setArrangeOptions(){
    const sortRecently = $$$("recently-added");
    const sortAlphabetical = $$$("alphabetical");
    const allPlaylistViewasItem = await $$(".playlist-viewas-item");
    const sortDefaultList = await $(".playlist-viewas-item.default-list");
    const sortDefaultGrid = await $(".playlist-viewas-item.default-grid");
    const sortCompactList = await $(".playlist-viewas-item.compact-list");
    const sortCompactGrid = await $(".playlist-viewas-item.compact-grid");
    
    const libraryContent = $(".library-content");
    const libraryContentItems = await $$(".library-item");
    const libraryContentItemImg = await $$(".item-image");
    const libraryContentItemIcon = await $(".item-icon.liked-songs");
    const libraryContentItemInfo = await $$(".item-info");
    const libraryContentItemTitle = await $$(".item-title");
    const libraryContentItemSubtitle = await $$(".item-subtitle");

    sortCompactList.addEventListener("click", function(){
        allPlaylistViewasItem.forEach(item => {
            item.classList.remove("active");
        })
        sortCompactList.classList.add("active");

        libraryContent.style.display = "flex";
        libraryContent.style.gridTemplateColumns = "none";
        libraryContentItems.forEach(item => {
            item.className = "library-item compact-list";
        })
        libraryContentItemImg.forEach(item => {
            item.className = "item-image compact-list";
        })
        libraryContentItemInfo.forEach(item => {
            item.className = "item-info compact-list";
        })
        libraryContentItemTitle.forEach(item => {
            item.className = "item-title compact-list";
        })
        libraryContentItemSubtitle.forEach(item => {
            item.className = "item-subtitle compact-list";
        })
        libraryContentItemIcon.className = "item-icon liked-songs compact-list";
        sortRecently.classList.remove("active");
        sortAlphabetical.classList.remove("active");
    })
    sortDefaultList.addEventListener("click", function(){
        allPlaylistViewasItem.forEach(item => {
            item.classList.remove("active");
        })
        sortDefaultList.classList.add("active");

        libraryContent.style.display = "flex";
        libraryContent.style.gridTemplateColumns = "none";
        libraryContentItems.forEach(item => {
            item.className = "library-item default-list"
        })
        libraryContentItemImg.forEach(item => {
            item.className = "item-image default-list"
        })
        libraryContentItemInfo.forEach(item => {
            item.className = "item-info default-list"
        })
        libraryContentItemTitle.forEach(item => {
            item.className = "item-title default-list"
        })
        libraryContentItemSubtitle.forEach(item => {
            item.className = "item-subtitle default-list"
        })
        libraryContentItemIcon.className = "item-icon liked-songs default-list";
        sortRecently.classList.remove("active");
        sortAlphabetical.classList.remove("active");
    })
    sortCompactGrid.addEventListener("click", function(){
        allPlaylistViewasItem.forEach(item => {
            item.classList.remove("active");
        })
        sortCompactGrid.classList.add("active");

        libraryContent.style.display = "grid";
        libraryContent.style.gridTemplateColumns = "minmax(0, 1fr) minmax(0, 1fr)";
        libraryContentItems.forEach(item => {
            item.className = "library-item compact-grid"
        })
        libraryContentItemImg.forEach(item => {
            item.className = "item-image compact-grid"
        })
        libraryContentItemInfo.forEach(item => {
            item.className = "item-info compact-grid"
        })
        libraryContentItemTitle.forEach(item => {
            item.className = "item-title compact-grid"
        })
        libraryContentItemSubtitle.forEach(item => {
            item.className = "item-subtitle compact-grid"
        })
        libraryContentItemIcon.className = "item-icon compact-grid";
        sortRecently.classList.remove("active");
        sortAlphabetical.classList.remove("active");
    })
    sortDefaultGrid.addEventListener("click", function(){
        allPlaylistViewasItem.forEach(item => {
            item.classList.remove("active");
        })
        sortDefaultGrid.classList.add("active");

        libraryContent.style.display = "grid";
        libraryContent.style.gridTemplateColumns = "minmax(0, 1fr) minmax(0, 1fr)";
        libraryContentItems.forEach(item => {
            item.className = "library-item default-grid"
        })
        libraryContentItemImg.forEach(item => {
            item.className = "item-image default-grid"
        })
        libraryContentItemInfo.forEach(item => {
            item.className = "item-info default-grid"
        })
        libraryContentItemTitle.forEach(item => {
            item.className = "item-title default-grid"
        })
        libraryContentItemSubtitle.forEach(item => {
            item.className = "item-subtitle default-grid"
        })
        libraryContentItemIcon.className = "item-icon liked-songs default-grid";
        sortRecently.classList.remove("active");
        sortAlphabetical.classList.remove("active");
    })
}

async function setFilterOptions(myPlaylists, myFollowedArtists, myFollowedPlaylist){
    const sortRecently = $$$("recently-added");
    const sortAlphabetical = $$$("alphabetical");

   sortRecently.addEventListener("click", function(){
        myPlaylists.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        myFollowedArtists.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        myFollowedPlaylist.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const libraryContent = $(".library-content");
        libraryContent.style.display = "flex";
        showMyPlaylistsElements(myPlaylists, myFollowedArtists, myFollowedPlaylist)

        sortRecently.classList.add("active");
        sortAlphabetical.classList.remove("active");
        $(".sort-options").classList.remove("active");
    })
    sortAlphabetical.addEventListener("click", function(){
        myPlaylists.sort((a, b) => a.name.localeCompare(b.name));
        myFollowedArtists.sort((a, b) => a.name.localeCompare(b.name));
        myFollowedPlaylist.sort((a, b) => a.name.localeCompare(b.name));
        const libraryContent = $(".library-content");
        libraryContent.style.display = "flex";
        showMyPlaylistsElements(myPlaylists, myFollowedArtists, myFollowedPlaylist)

        sortRecently.classList.remove("active");
        sortAlphabetical.classList.add("active");
        $(".sort-options").classList.remove("active");
    })
}

export function getFooterActions(track){
    const player = $(".player");
    const banner = $(".banner");
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if(!currentUser){
        player.style.display = "none";
        banner.style.display = "flex";
    } else {
        player.style.display = "flex";
        banner.style.display = "none";
        updatePlayer(track, false);
    }
}

async function showArtistDetailSection(artistID, popularTracks, artists, playlists){
    const artist = await helper.getArtistByID(artistID);
    const artistPopularTracks = await helper.getArtistPopularTracks(artistID)
        .then(result => result.tracks);
    let artistHTMLTracks = "";
    artistPopularTracks.forEach((track, index) => {
        track.artist_name = artist.name;
        artistHTMLTracks += `<tr class="track-in-list">
                        <td>${index + 1}</td>
                        <td>${track.title}</td>
                        <td>${track.artist_name ? track.artist_name : artist.name}</td>
                        <td>${Math.floor(track.duration/60)}:${(track.duration%60).toString().padStart(2,"0")}</td>
                    </tr>`
    })
    let html =`<!-- Artist Hero Section -->
                <section class="artist-hero">
                    <div class="hero-background">
                        <img
                            src="${artist.background_image_url}"
                            alt="${artist.name} artist background"
                            class="hero-image"
                        />
                        <div class="hero-overlay"></div>
                        <div class="hero-back">
                            <span>⭠</span>
                        </div>
                    </div>
                    <div class="hero-content">
                        <div class="verified-badge">
                            <i class="fas fa-check-circle"></i>
                            <span>Verified Artist</span>
                        </div>
                        <h1 class="artist-name">${artist.name}</h1>
                        <p class="monthly-listeners">
                            ${artist.monthly_listeners} monthly listeners
                        </p>
                        <p class="is-following">
                            ${artist.is_following 
                                ? 'Followed'
                                : 'Not Followed'
                            }
                        </p>
                    </div>
                </section>

                <!-- Artist Controls -->
                <section class="artist-controls">
                    <button class="artist-controls-play-btn">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="artist-controls-add-btn">
                        <i class="fa-solid fa-plus"></i>
                        <ul class="follow-artist-options">
                            ${ artist.is_following
                                ?'<li class="unfollow-artist">Unfollow Artist</li>'
                                :'<li class="follow-artist">Follow Artist</li>'
                            }
                        </ul>
                    </button>
                </section>
                
                <!-- Popular Tracks -->
                <section class="popular-section">
                    <h2 class="section-title">Popular</h2>
                    <div class="artist-detail-tracklist">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tiêu đề</th>
                                    <th>Nghệ sĩ</th>
                                    <th>Thời lượng</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${artistHTMLTracks}
                            </tbody>
                        </table>
                    </div>
                </section>`;
    const contentWrapper = $('.content-wrapper');
    contentWrapper.innerHTML = html;

    const arrowBack = $(".hero-back");
    arrowBack.addEventListener('click', function(){
        showHomeSections(popularTracks, artists, playlists);
    })

    const trackDetailControls = $(".artist-controls");
    const playAlbumBtn = trackDetailControls.querySelector(".artist-controls-play-btn");
    playAlbumBtn.addEventListener('click', function(){
        stateHolder.readyToPlayTracks = artistPopularTracks;
        stateHolder.albumState = true;
        updatePlayer(artistPopularTracks[0], stateHolder.currentAudio);
    })

    $$(".track-in-list").forEach((track, index) => {
        track.addEventListener("click", function(){
            updatePlayer(artistPopularTracks[index], stateHolder.currentAudio)
        })
    })

    const artistControlsAddBtn = $(".artist-controls-add-btn");
    const followArtistBtn = $(".follow-artist");
    const unfollowArtistBtn = $(".unfollow-artist");
    const optionsFollowArtist = $(".follow-artist-options");
    
    artistControlsAddBtn.addEventListener("click", function(){
        optionsFollowArtist.classList.toggle("active");
    })
    if(followArtistBtn){
        followArtistBtn.addEventListener("click", async function(e){
            try {
                await helper.followedArtist(artistID, {token: stateHolder.token});
                // Reupdate some elements
                showMyPlaylists();
                showArtistDetailSection(artistID, popularTracks, artists, playlists)
                toastSnackbar("Success!");
            } catch (error) {
                toastSnackbar(error);
            }
        })
    }
    if(unfollowArtistBtn){
        unfollowArtistBtn.addEventListener("click", async function(e){
            try {
                await helper.unfollowedArtist(artistID, {token: stateHolder.token});
                // Reupdate some elements
                showMyPlaylists();
                showArtistDetailSection(artistID, popularTracks, artists, playlists)
                toastSnackbar("Success!");
            } catch (error) {
                toastSnackbar(error);
            }
        })
    }
}

function showBiggestHitSection(popularTracks){
    let html = `<section class="hits-section">
                    <div class="section-header">
                        <h2 class="section-heading">
                            Today's biggest hits
                        </h2>
                    </div>
                    <div class="hits-grid">`;
    html += showHitCards(popularTracks);
    html += "</div></section>";
    return html;
}

function showPopularArtistsSection(artists) {
    let html = `<section class="artists-section">
                        <div class="section-header">
                            <h2 class="section-heading">Popular artists</h2>
                        </div>
                        <div class="artists-grid">`;
    html += showArtistCards(artists);
    html += "</div></section>";
    return html
}

function showAllPlaylistSection(playlists) {
    let html = `<section class="playlists-section">
                        <div class="section-header">
                            <h2 class="section-heading">All playlists</h2>
                        </div>
                        <div class="playlists-grid">`;
    html += showPlaylistCards(playlists);
    html += "</div></section>";
    return html
}


export function showHomeSections(popularTracks, artists, playlists){
    const contentWrapper = $('.content-wrapper');
    let homeSectionsHtml = '';
    // Today's Biggest Hits Section
    homeSectionsHtml += showBiggestHitSection(popularTracks);

    // Popular Artists Section
    homeSectionsHtml += showPopularArtistsSection(artists);

    // Playlist Section
    homeSectionsHtml += showAllPlaylistSection(playlists);

    contentWrapper.innerHTML = homeSectionsHtml;

    const artistsCards = $$(".artist-card");
    if(artistsCards){
        for(let artistCard of artistsCards){
            artistCard.addEventListener("click", function(e){
                const card = e.target.closest('.artist-card');
                const artistID = card.dataset.artistId;
                showArtistDetailSection(artistID, popularTracks, artists, playlists);
            })
        }
    }

    const tracksCards = $$(".hit-card");
    if(tracksCards){
        tracksCards.forEach(trackCard => {
            trackCard.addEventListener("click", function(e){
                const card = e.target.closest(".hit-card");
                const trackId = card.dataset.trackId;
                showTrackDetailSection(trackId, popularTracks, artists, playlists);
            })
        })
    }
    const trackCardBtns = $$(".hit-play-btn");
    if(trackCardBtns){
        trackCardBtns.forEach((trackCardBtn,index) => {
            trackCardBtn.addEventListener("click", function(e){
                e.stopPropagation();
                stateHolder.readyToPlayTracks = [];
                stateHolder.albumState = false;
                updatePlayer(popularTracks[index]);
            })
        })
    }

    const playlistImgs = $$(".playlist-card-cover-child");
    playlistImgs.forEach(img => {
        img.onerror = () => img.src = stateHolder._randomImg;
    })

    const playlistsCards = $$(".playlist-card");
    if(playlistsCards){
        playlistsCards.forEach(playlistCard => {
            playlistCard.addEventListener("click", function(e){
                const card = e.target.closest(".playlist-card");
                const playlistId = card.dataset.playlistId;
                showPlaylistDetailSection(playlistId, popularTracks, artists, playlists);
            })
        })
    }

    const logoBtn = $(".logo");
    logoBtn.addEventListener('click', function(){
        showHomeSections(popularTracks, artists, playlists);
    })
    const homeBtn = $(".home-btn");
    homeBtn.addEventListener('click', function(){
        showHomeSections(popularTracks, artists, playlists);
    })
}

async function showTrackDetailSection(trackId, popularTracks, artists, playlists){
    try {
        const contentWrapper = $('.content-wrapper');
        const trackDetail = await helper.getTrackByID(trackId);
        let imgExtension = getFileExtension(trackDetail.image_url);
        const year = new Date(trackDetail.created_at).getFullYear();
        const month = new Date(trackDetail.created_at).getMonth();
        const day = new Date(trackDetail.created_at).getDate();
        const min = Math.floor(trackDetail.duration/60);
        const sec = (trackDetail.duration%60).toString().padStart(2,"0");
        const listTrackInAlbum = await helper.getAlbumTracks(trackDetail.album_id);
        const tracks = await listTrackInAlbum.tracks;
        const getMyPlaylists = await helper.getMyPlaylists({token: stateHolder.token});
        
        const likePlaylist = await getMyPlaylists?.playlists.filter(item => item.is_public === 0);
        const likePlaylistID = await likePlaylist[0].id;
        const getLikedTracks = await helper.getPlaylistTracks(likePlaylistID, {token: stateHolder.token})
        const isInclude = await getLikedTracks.tracks.find(item => {
            return item.track_id === trackId;
        });

        let tracksInAlbum = ''
        tracks.forEach((track, index) => {
            tracksInAlbum += `<tr class="track-in-list">
                            <td>${index + 1}</td>
                            <td>${track.title}</td>
                            <td>${track.artist_name}</td>
                            <td>${Math.floor(track.duration/60)}:${(track.duration%60).toString().padStart(2,"0")}</td>
                        </tr>`
        })
        
        let html = `<div class="track-detail-container">
            <div class="track-detail-header">
                <img src="${stateHolder._validImageTypes.includes(imgExtension)
                    ? trackDetail.image_url : stateHolder._randomImg}" alt="${trackDetail.title}" class="track-detail-cover" />
                <div class="track-detail-info">
                    <p>Đĩa đơn</p>
                    <h1>${trackDetail.title}</h1>
                    <p>${trackDetail.artist_name} • ${year} • 1 bài hát, ${min} phút ${sec} giây</p>
                </div>
                <div class="track-back">
                    <span>⭠</span>
                </div>
            </div>

            <div class="track-detail-controls">
                <button class="play-album-btn"><i class="fa-solid fa-play"></i></button>
                <button class="add-track-btn">
                    <i class="fa-solid fa-plus"></i>
                    <ul class="add-track-detail-options">
                        ${isInclude
                            ?'<li class="remove-detail-to-liked">Remove to Liked tracks</li>'
                            :'<li class="add-detail-to-liked">Add to Liked tracks</li>'
                        }
                        <li class="add-detail-to-playlist">Add to Playlist</li>
                    </ul>
                </button>
                <!---<button><i class="fa-solid fa-download"></i></button>
                <button><i class="fa-solid fa-ellipsis"></i></button> --->
            </div>

            <div class="track-detail-tracklist">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tiêu đề</th>
                            <th>Nghệ sĩ</th>
                            <th>Thời lượng</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tracksInAlbum}
                    </tbody>
                </table>
            </div>

            <div class="track-detail-footer">
                <p>${day} tháng ${month}, ${year} • © ${year} ${trackDetail.artist_name}</p>
            </div>
        </div>`
        contentWrapper.innerHTML = html;

        const arrowBack = $(".track-back");
        arrowBack.addEventListener('click', function(){
            showHomeSections(popularTracks, artists, playlists);
        })

        const trackDetailControls = $(".track-detail-controls");
        const playAlbumBtn = trackDetailControls.querySelector(".play-album-btn");
        playAlbumBtn.addEventListener('click', function(){
            stateHolder.readyToPlayTracks = tracks;
            stateHolder.albumState = true;
            updatePlayer(tracks[0], stateHolder.currentAudio);
        })

        $$(".track-in-list").forEach((track, index) => {
            track.addEventListener("click", function(){
                updatePlayer(tracks[index], stateHolder.currentAudio)
            })
        })

        const addTrackDetailBtn = $(".add-track-btn");
        const addTrackDetailToLiked = $(".add-detail-to-liked");
        const removeTrackDetailToLiked = $(".remove-detail-to-liked");
        const addTrackDetailToPlaylist = $(".add-detail-to-playlist");
        const optionsDetailList = $(".add-track-detail-options");
        
        addTrackDetailBtn.addEventListener("click", function(){
            optionsDetailList.classList.toggle("active");
        })
        if(addTrackDetailToLiked){
            addTrackDetailToLiked.addEventListener("click", async function(e){
                try {
                    const getMyPlaylists = await helper.getMyPlaylists({token: stateHolder.token});
                    const myPlaylists = await getMyPlaylists?.playlists.filter(item => item.is_public === 0);
                    const myPlaylistID = myPlaylists[0].id;
                    const data = {
                        "track_id": trackId,
                        "position": 0
                    }
                    await helper.addTrackToPlaylist(myPlaylistID, data, {token: stateHolder.token});
                    // Reupdate some elements
                    showMyPlaylists();
                    getFooterActions();
                    showTrackDetailSection(trackId, popularTracks, artists, playlists)
                    toastSnackbar("Success!");
                } catch (error) {
                    toastSnackbar(error);
                }
            })
        }
        if(removeTrackDetailToLiked){
            removeTrackDetailToLiked.addEventListener("click", async function(e){
                try {
                    const getMyPlaylists = await helper.getMyPlaylists({token: stateHolder.token});
                    const myPlaylists = await getMyPlaylists?.playlists.filter(item => item.is_public === 0);
                    const myPlaylistID = myPlaylists[0].id;
                    await helper.removeTrackFromPlaylist(myPlaylistID, trackId, {token: stateHolder.token});
                    // Reupdate some elements
                    showMyPlaylists();
                    showTrackDetailSection(trackId, popularTracks, artists, playlists)
                    toastSnackbar("Success!");
                } catch (error) {
                    toastSnackbar(error);
                }
            })
        }
        const myPlaylistModal = $$$("myPlaylistModal");
        addTrackDetailToPlaylist.addEventListener("click", async function(){
            myPlaylistModal.classList.toggle("show");
            showMyPlaylistsAddTrack();
        })
    } catch (error) {
        toastSnackbar(error);
    }
}

async function updatePlayer(track, isPlayed = true){
    if(track.id){
        const getMyPlaylists = await helper.getMyPlaylists({token: stateHolder.token});
        const likePlaylist = await getMyPlaylists?.playlists.filter(item => item.is_public === 0);
        const likePlaylistID = likePlaylist[0].id;
        const getLikedTracks = await helper.getPlaylistTracks(likePlaylistID, {token: stateHolder.token})
        const isInclude = getLikedTracks.tracks.find(item => {
            return item.track_id === track.id;
        });
        const player = $(".player");
        let imgExtension = track.image_url 
            ? getFileExtension(track?.image_url)
            : getFileExtension(track?.artist_image_url);
        let imgUrl = track.image_url ? track.image_url : track.artist_image_url
        let time = ""
        if(track.track_duration){
            time = `${Math.floor(track.track_duration/60)}:${(track.track_duration%60).toString().padStart(2,"0")}`
        } else {
            time = `${Math.floor(track.duration/60)}:${(track.duration%60).toString().padStart(2,"0")}`
        }
        let html = `<div class="player-left">
                        <img src="${stateHolder._validImageTypes.includes(imgExtension)
                            ? imgUrl : stateHolder._randomImg}" alt="Current track" class="player-image" />
                        <div class="player-info">
                            <div class="player-title">
                                ${track.track_title ? track.track_title : track.title}
                            </div>
                            <div class="player-artist">${track.artist_name}</div>
                        </div>
                        <button class="add-btn" data-track-id="${track.id}">
                            <i class="fa-solid fa-plus"></i>
                            <span class="add-btn-tooltip">Add track</span>
                            <ul class="add-track-options">
                                ${ isInclude
                                    ?'<li class="remove-to-liked">Remove to Liked tracks</li>'
                                    :'<li class="add-to-liked">Add to Liked tracks</li>'}
                                <li class="add-to-playlist">
                                    Add to Playlist
                                </li>
                            </ul>
                        </button>
                    </div>
                    
                    <div class="player-center">
                        <div class="player-controls">
                            <button class="control-btn btn-shuffle ${stateHolder._shuffleState ? "active" : ""}">
                                <i class="fas fa-random"></i>
                                <div class="control-btn-tooltip">Shuffle</div>
                                </button>
                            <button class="control-btn btn-back-track" data-track-id="${track.id}">
                                <i class="fas fa-step-backward"></i>
                                <div class="control-btn-tooltip">Previous</div>
                            </button>
                            <button class="control-btn play-btn" data-track-id="${track.id}">
                                <i class="fas fa-play"></i>
                                <div class="control-btn-tooltip">Play</div>
                            </button>
                            <button class="control-btn btn-next-track" data-track-id="${track.id}">
                                <i class="fas fa-step-forward"></i>
                                <div class="control-btn-tooltip">Next</div>
                            </button>
                            <button class="control-btn btn-repeat">
                                <i class="fas fa-redo"></i>
                                ${stateHolder._repeatState !== 0 ? `<span>${stateHolder._repeatState}</span>` : "" }
                                <div class="control-btn-tooltip">Repeat</div>
                            </button>
                        </div>
                        <div class="progress-container">
                            <span class="time current-time-played">00:00</span>
                            <div class="time-seek-container">
                                <input type="range" min="0" max="100" value="0" id="progress-track-fill" class="range-input" />
                                <span class="time-seek"></span>
                            </div>
                            <span class="time">${time}</span>
                        </div>
                    </div>
                    
                    <div class="player-right">
                        <button class="control-btn">
                            <i class="fas fa-microphone"></i>
                        </button>
                        <div class="volume-container">
                            <button class="control-btn volumne-btn">
                                <i class="fas fa-volume-down"></i>
                                <div class="control-btn-tooltip">Volumne</div>
                            </button>
                            <input type="range" min="0" max="100" value="100" id="volume-track-fill" class="range-input" />
                        </div>
                        <button class="control-btn">
                            <i class="fas fa-expand"></i>
                        </button>
                    </div>`
        player.innerHTML = html;
        
        await audioController(track, stateHolder.currentAudio, isPlayed);
    }
}

async function audioController(track, audio, isPlayed){
    audio.src = track.track_audio_url ? track.track_audio_url : track.audio_url;
    audio.load();
    let isDragging = false;
    audio.onloadedmetadata = function(){
        updateTimeHandler(this, isDragging);
    }
    audio.ontimeupdate = function(){
        updateTimeHandler(this, isDragging);
    }
    audio.onended = function(){
        handleEndedAudio(audio, track);
    };
    if(isPlayed){
        audio.play();
    }
    
    const repeatBtn = $(".control-btn.btn-repeat");
    repeatBtn.addEventListener("click", function(){
        stateHolder._repeatState += 1;
        if(stateHolder._repeatState > 2){
            stateHolder._repeatState = 0;
        }
        if(stateHolder._repeatState !== 0){
            repeatBtn.classList.add("active");
        } else {
            repeatBtn.classList.remove("active");
        }
        repeatBtn.innerHTML = `<i class="fas fa-redo"></i>
                            ${stateHolder._repeatState !== 0 ? `<span>${stateHolder._repeatState}</span>` : "" }`;
    })
    const playBtn = $(".control-btn.play-btn");
    if(audio.paused){
        playBtn.innerHTML = '<i class="fas fa-play"></i><div class="control-btn-tooltip">Play</div>'
    } else {
        playBtn.innerHTML = '<i class="fas fa-pause"></i><div class="control-btn-tooltip">Play</div>'
    }
    playBtn.addEventListener("click", function(){
        if(audio.paused){
            audio.play();
            this.innerHTML = '<i class="fas fa-pause"></i><div class="control-btn-tooltip">Play</div>'
        } else {
            audio.pause();
            this.innerHTML = '<i class="fas fa-play"></i><div class="control-btn-tooltip">Play</div>'
        }
    })
    const volumeBtn = $(".volumne-btn");
    volumeBtn.addEventListener("click", function(){
        audio.muted = !audio.muted;
    })
    const shuffleBtn = $(".control-btn.btn-shuffle");
    shuffleBtn.addEventListener("click", function(){
        shuffleBtn.classList.toggle("active");
        stateHolder._shuffleState = !stateHolder._shuffleState;
    })
    const backTrackBtn = $(".control-btn.btn-back-track");
    backTrackBtn.addEventListener("click", function(){
        backTrackBtn.classList.toggle("active");
        setTimeout(()=>{
            backTrackBtn.classList.toggle("active");
        }, 300)
        if(stateHolder.albumState){
            let trackOrder = stateHolder.readyToPlayTracks.findIndex(x => x.id === track.id);
            let listLength = stateHolder.readyToPlayTracks.length 
            if(stateHolder._shuffleState){
                let random = trackOrder;
                while(random === trackOrder){
                    random = getRandomIndex(listLength);
                }
                updatePlayer(stateHolder.readyToPlayTracks[random], stateHolder.currentAudio);
            }else{
                if(trackOrder < listLength - 1){
                    updatePlayer(stateHolder.readyToPlayTracks[((trackOrder + stateHolder._prev) % listLength)], stateHolder.currentAudio)
                }
                if(trackOrder === listLength - 1){
                    updatePlayer(stateHolder.readyToPlayTracks[0], stateHolder.currentAudio);
                }
            }
        } else {
            alert("There is no other track in playlist!");
        }
    })
    const nextTrackBtn = $(".control-btn.btn-next-track");
    nextTrackBtn.addEventListener("click", function(){
        nextTrackBtn.classList.toggle("active");
        setTimeout(()=>{
            nextTrackBtn.classList.toggle("active");
        }, 300)
        if(stateHolder.albumState){
            let trackOrder = stateHolder.readyToPlayTracks.findIndex(x => x.id === track.id);
            let listLength = stateHolder.readyToPlayTracks.length 
            if(stateHolder._shuffleState){
                let random = trackOrder;
                while(random === trackOrder){
                    random = getRandomIndex(listLength);
                }
                updatePlayer(stateHolder.readyToPlayTracks[random], stateHolder.currentAudio);
            }else{
                if(trackOrder < listLength - 1){
                    updatePlayer(stateHolder.readyToPlayTracks[((trackOrder + stateHolder._next) % listLength)], stateHolder.currentAudio)
                }
                if(trackOrder === listLength - 1){
                    updatePlayer(stateHolder.readyToPlayTracks[0], stateHolder.currentAudio);
                }
            }
        } else {
            alert("There is no other track in playlist!");
        }
    })

    const addBtn = $(".add-btn");
    const addToLiked = $(".add-to-liked");
    const removeToLiked = $(".remove-to-liked");
    const addToPlaylist = $(".add-to-playlist");
    const optionsList = $(".add-track-options");
    
    addBtn.addEventListener("click", function(){
        optionsList.classList.toggle("active");
    })
    if(addToLiked){
        addToLiked.addEventListener("click", async function(e){
            try {
                const getMyPlaylists = await helper.getMyPlaylists({token: stateHolder.token});
                const myPlaylists = await getMyPlaylists?.playlists.filter(item => item.is_public === 0);
                const myPlaylistID = myPlaylists[0].id;
                const addBtn = $(".add-btn");
                const trackID = addBtn.dataset?.trackId;
                const data = {
                    "track_id": trackID,
                    "position": 0
                }
                await helper.addTrackToPlaylist(myPlaylistID, data, {token: stateHolder.token});
                showMyPlaylists();
                updatePlayer(track, false);
                toastSnackbar("Success!");
            } catch (error) {
                toastSnackbar(error);
            }
        })
    }
    if(removeToLiked){
        removeToLiked.addEventListener("click", async function(e){
            try {
                const getMyPlaylists = await helper.getMyPlaylists({token: stateHolder.token});
                const myPlaylists = await getMyPlaylists?.playlists.filter(item => item.is_public === 0);
                const myPlaylistID = myPlaylists[0].id;
                const addBtn = $(".add-btn");
                const trackID = addBtn.dataset?.trackId;
                await helper.removeTrackFromPlaylist(myPlaylistID, trackID, {token: stateHolder.token});
                showMyPlaylists();
                updatePlayer(track, false);
                toastSnackbar("Success!");
            } catch (error) {
                toastSnackbar(error);
            }
        })
    }
    const myPlaylistModal = $$$("myPlaylistModal");
    addToPlaylist.addEventListener("click", async function(){
        myPlaylistModal.classList.toggle("show");
        showMyPlaylistsAddTrack();
    })

    const myPlaylistModalClose = $$$("myPlaylistModalClose");
    myPlaylistModalClose.addEventListener("click", function(){
        myPlaylistModal.classList.remove("show");
    })

    const progressBar = $("#progress-track-fill");
    const currentTimePlayed = $(".current-time-played");
    const timeSeek = $(".time-seek");
    progressBar.addEventListener("input", function(event) {
        const tempSliderValue = event.target.value;
        const progress = (tempSliderValue / progressBar.max) * 100;
        progressBar.style.background = `linear-gradient(to right, #f50 ${progress}%, #ccc ${progress}%)`;

        audio.currentTime = (progress * audio.duration) / 100;
        const min = Math.floor(audio.currentTime / 60).toString().padStart(2, '0');
        const sec = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
        currentTimePlayed.innerHTML = `${min}:${sec}`;
    })
    progressBar.onmouseenter = showSeeking(progressBar, timeSeek);
    progressBar.onmouseleave = function(){
      timeSeek.textContent = "";
      timeSeek.style.visibility = "hidden";
      timeSeek.style.opacity = "0";
      progressBar.style.setProperty('--afterBack', '0%');
    }
    const volumeBar = $("#volume-track-fill")
    volumeBar.addEventListener("input", function(event) {
        const tempSliderValue = event.target.value;
        const volume = (tempSliderValue / volumeBar.max) * 100;
        audio.volume = (tempSliderValue * 1) / 100;
        volumeBar.style.background = `linear-gradient(to right, #f50 ${volume}%, #ccc ${volume}%)`;
    })
}

async function showMyPlaylistsAddTrack(){
    try {
        const getMyPlaylists = await helper.getMyPlaylists({token: stateHolder.token});
        const myPlaylists = await getMyPlaylists?.playlists;
        const allPlaylists = $(".my-playlist-modal-list");
        let html = '';
        myPlaylists.forEach(myPlaylist => {
            if(myPlaylist.image_url){
                html +=`<div class="my-playlist-modal-item"
                            data-playlist-id="${myPlaylist.id}">
                            <div class="my-playlist-modal-img">
                                <img src="${myPlaylist.image_url}"
                                alt="${myPlaylist.name}"
                                class="" />
                            </div>
                            ${myPlaylist.name}
                        </div>`
            } else {
                html += `<div class="my-playlist-modal-item"
                                data-playlist-id="${myPlaylist.id}">
                            <div class="my-playlist-modal-img">
                                <i class="fas fa-heart"></i>
                            </div>
                            ${myPlaylist.name}
                        </div>`
            }
        })
        allPlaylists.innerHTML = html;
        
        const myPlaylistsItems = $$(".my-playlist-modal-item");
        myPlaylistsItems.forEach(item => {
            item.addEventListener("click", async function(){
                const playlistsID = item.dataset?.playlistId;
                const addBtn = $(".add-btn");
                const trackID = addBtn.dataset?.trackId;
                const data = {
                    "track_id": trackID,
                    "position": 0
                }
                try {
                    await helper.addTrackToPlaylist(playlistsID, data, {token: stateHolder.token});
                    showMyPlaylists();
                    $$$("myPlaylistModal").classList.remove("show");
                    toastSnackbar("Success!");
                } catch (error) {
                    await helper.removeTrackFromPlaylist(playlistsID, trackID, {token: stateHolder.token});
                    showMyPlaylists();
                    $$$("myPlaylistModal").classList.remove("show");
                    toastSnackbar("Remove Successed!");
                }
            })
        })
    } catch (error) {
        toastSnackbar(error);
    }
}

function handleEndedAudio(audio, currentTrack){
    if(stateHolder.readyToPlayTracks.length > 0){
        switch(stateHolder._repeatState){
            case 0:
                audio.pause();
                break;
            case 1:
                audio.play();
                break;
            case 2:
                if(stateHolder._shuffleState){
                    let trackOrder = stateHolder.readyToPlayTracks.findIndex(x => x.id === currentTrack.id);
                    let listLength = stateHolder.readyToPlayTracks.length 
                    if(stateHolder._shuffleState){
                        let random = trackOrder;
                        while(random === trackOrder){
                            random = getRandomIndex(listLength);
                        }
                        updatePlayer(stateHolder.readyToPlayTracks[random], stateHolder.currentAudio);
                    }
                } else {
                    const index = stateHolder.readyToPlayTracks.findIndex(x => x.id === currentTrack.id);
                    if(index < stateHolder.readyToPlayTracks.length - 1){
                        updatePlayer(stateHolder.readyToPlayTracks[index + 1]);
                    }
                    if(index === stateHolder.readyToPlayTracks.length -1){
                        updatePlayer(stateHolder.readyToPlayTracks[0]);
                    }
                }
                audio.play();
                break;
        }
    } else {
        switch(stateHolder._repeatState){
            case 0:
                audio.pause();
                break;
            case 1:
                audio.play();
                break;
            case 2:
                audio.play();
                break;
        }
    }
}

function getRandomIndex(max){
    return Math.floor(Math.random() * max);
}

function updateTimeHandler(audio = stateHolder.currentAudio, isDragging = false, position){
    const currentTimePlayed = $(".current-time-played");
    const progressHandle = $("#progress-track-fill");
    const min = Math.floor(audio.currentTime / 60).toString().padStart(2, '0');
    const sec = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
    progressHandle.value = audio.currentTime;
    progressHandle.max = Math.floor(audio.duration);
    currentTimePlayed.innerHTML = `${min}:${sec}`;
    const currentProgress = Math.round(progressHandle.value * 100 / progressHandle.max);
    progressHandle.style.background = `linear-gradient(to right, #f50 ${currentProgress}%, #ccc ${currentProgress}%)`;
}

function showSeeking(progressBar, timeSeek){
    progressBar.addEventListener("mousemove", (e) => {
        const elementWidth = e.target.offsetWidth;
        const rect = e.target.getBoundingClientRect();
        let currentPosition = e.clientX - rect.left;
        let percentage = Math.round(currentPosition / elementWidth * 100);
        let currentSeeking = percentage * stateHolder.currentAudio.duration /100;
        if(currentSeeking < 0) {
            currentSeeking = 0;
            timeSeek.style.left = `0px`;
        } else if(currentSeeking > stateHolder.currentAudio.duration) {
            currentSeeking = stateHolder.currentAudio.duration;
            timeSeek.style.left = `${elementWidth}px`;
        } else {
            timeSeek.style.left = `${currentPosition}px`;
        }
        const min = Math.floor(currentSeeking / 60).toString().padStart(2, '0');
        const sec = Math.floor(currentSeeking % 60).toString().padStart(2, '0');
        timeSeek.textContent = `${min}:${sec}`;
        timeSeek.style.visibility = "visible";
        timeSeek.style.opacity = "1";
        progressBar.style.setProperty('--afterBack', `${percentage}%`)

    });
}

export function manipulateKeyUp(event, volume){
    const volumeBar = $("#volume-track-fill");
    switch (event.code){
        case 'Space':
            const playBtn = $(".control-btn.play-btn");
            if(stateHolder.currentAudio.paused){
                stateHolder.currentAudio.play();
                playBtn.innerHTML = '<i class="fas fa-pause"></i>'
            } else {
                stateHolder.currentAudio.pause();
                playBtn.innerHTML = '<i class="fas fa-play"></i><div class="control-btn-tooltip">Play</div>'
            }
            break;
        case 'ArrowUp':
            if(stateHolder.currentAudio.volume <= 0.95){
                stateHolder.currentAudio.volume += 0.05;
            }
            if(stateHolder.currentAudio.volume > 0.95 && stateHolder.currentAudio.volume < 1){
                stateHolder.currentAudio.volume = 1;
            }
            volumeBar.value = stateHolder.currentAudio.volume * 100;
            volumeBar.classList.add('active');
            volumeBar.style.background = `linear-gradient(to right, #f50 ${volumeBar.value}%, #ccc ${volumeBar.value}%)`;
            setTimeout(()=>{
                volumeBar.classList.remove('active');
            }, 2000)
            break;
        case 'ArrowDown':
            if(stateHolder.currentAudio.volume > 0.05){
                stateHolder.currentAudio.volume -= 0.05;
            }
            if(stateHolder.currentAudio.volume < 0.05 && stateHolder.currentAudio.volume > 0){
                stateHolder.currentAudio.volume = 0;
            }
            volumeBar.value = stateHolder.currentAudio.volume * 100;
            volumeBar.classList.add('active');
            volumeBar.style.background = `linear-gradient(to right, #f50 ${volumeBar.value}%, #ccc ${volumeBar.value}%)`;
            setTimeout(()=>{
                volumeBar.classList.remove('active');
            }, 2000)
            break;
        case 'ArrowLeft':
            if(stateHolder.currentAudio.currentTime <= 5){
                stateHolder.currentAudio.currentTime = 0;
            }
            stateHolder.currentAudio.currentTime -= 5;
            updateTimeHandler(stateHolder.currentAudio);
            break;
        case 'ArrowRight':
            if(stateHolder.currentAudio.duration - stateHolder.currentAudio.currentTime <=5){
                stateHolder.currentAudio.currentTime = stateHolder.currentAudio.duration
            }
            stateHolder.currentAudio.currentTime += 5
            updateTimeHandler(stateHolder.currentAudio);
            break;
        case "KeyM":
            stateHolder.currentAudio.muted = !stateHolder.currentAudio.muted;
            break;
        case "KeyR":
            const repeatBtn = $(".control-btn.btn-repeat");
            stateHolder._repeatState += 1;
            if(stateHolder._repeatState > 2)
                stateHolder._repeatState = 0;

            if(stateHolder._repeatState !== 0){
                repeatBtn.classList.add("active");
            } else {
                repeatBtn.classList.remove("active");
            }
            
            repeatBtn.innerHTML = `<i class="fas fa-redo"></i>
                                ${stateHolder._repeatState !== 0 ? `<span>${stateHolder._repeatState}</span>` : "" }`;
            break;
        case "KeyS":
            const shuffleBtn = $(".control-btn.btn-shuffle");
            shuffleBtn.classList.toggle("active");
            stateHolder._shuffleState = !stateHolder._shuffleState;
            break;
    }
}

function getFileExtension(url) {
    // Remove any query parameters by splitting at '?' and taking the first part
    const urlWithoutQueryParams = url.split('?')[0];

    // Split the remaining URL string by '.'
    const parts = urlWithoutQueryParams.split('.');

    // If there's only one part (no dot or no extension), return an empty string or handle as needed
    if (parts.length === 1) {
        return ''; // Or throw an error, or return null, depending on desired behavior
    }

    // Pop the last element, which should be the file extension
    return parts.pop();
}

function escapeHtml(unsafe) {
    return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;"); // or &apos; if context allows
}

function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (regex.test(password)) {
        return { isValid: true, message: "Password is strong." };
    } else {
        let message = "Password must meet the following criteria:\n";
        if (!/(?=.*[a-z])/.test(password)) {
            message += "* At least one lowercase letter.\n";
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            message += "* At least one uppercase letter.\n";
        }
        if (!/(?=.*\d)/.test(password)) {
            message += "* At least one number.\n";
        }
        if (!/(?=.*[@$!%*?&])/.test(password)) {
            message += "* At least one special character (@$!%*?&).\n";
        }
        if (password.length < 8) {
            message += "* At least 8 characters long.\n";
        }
        if (password || password.trim()){
            message += "* Cannot be empty..\n";
        }
        return { isValid: false, message: message.trim() };
    }
}

function validateEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}

function forminputNotification(elements, message){
    let notification = `<i class="fas fa-info-circle"></i>
                        <span>${message}</span>`;

    elements.closest('.form-group').classList.add('invalid');
    elements.nextElementSibling.innerHTML = notification;
}

function forminputRemoveNotification(elements){
    elements.closest('.form-group').classList.remove('invalid');
    elements.nextElementSibling.innerHTML = ""
}

async function checkValidToken(){
    try{
        const user = JSON.parse(localStorage.getItem("user"));
        if(user){
            const token = user.access_token;
            if(isTokenExpired(token)){
                const response = await helper.refeshToken({token: token});
                localStorage.setItem('user', JSON.stringify({ user: user.user, access_token: response.access_token}));
                return response.access_token;
            } else {
                return token;
            }
        } else {
            return "";
        }
    } catch (error){
        toastSnackbar(error);
    }
}

function isTokenExpired(token) {
    if (!token) return true;
    const payload = JSON.parse(atob(token.split('.')[1]));
    // exp is in seconds, Date.now() is in ms
    return payload.exp * 1000 < Date.now();
}

function toastSnackbar(message) {
  var snackbar = $$$("snackbar");
  snackbar.textContent = message
  snackbar.className = "show";
  setTimeout(function(){ snackbar.className = snackbar.className.replace("show", ""); }, 3000);
}