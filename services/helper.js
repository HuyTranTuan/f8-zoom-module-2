import httpRequest from "./apiHttp.js";

class Helper{
    constructor(){}

    async getCurrentUser(){
        return await httpRequest.get("users/me");
    }

    async getArtists(){
        return await httpRequest.get('artists');
    }
    async getArtistByID(artistID){
        return await httpRequest.get(`artists/${artistID}`);
    }

    async getArtistPopularTracks(artistID){
        return await httpRequest.get(`artists/${artistID}/tracks/popular`);
    }

    async getTrendingArtists(){
        return await httpRequest.get('artists/trending');
    }

    async getAlbums(){
        return await httpRequest.get('albums');
    }
    async getAlbumByID(albumID){
        return await httpRequest.get(`albums/${albumID}`);
    }
    async getAlbumByID(albumID){
        return await httpRequest.get(`albums/${albumID}`);
    }
    async getAlbumTracks(albumID){
        return await httpRequest.get(`albums/${albumID}/tracks`);
    }
    async getPopularAlbums(){
        return await httpRequest.get('albums/popular');
    }

    async getTracks(){
        return await httpRequest.get('tracks');
    }
    async getTrackByID(trackId){
        return await httpRequest.get(`tracks/${trackId}`);
    }
    async getPopularTracks(){
        return await httpRequest.get('tracks/popular');
    }
    async getTrendingTracks(){
        return await httpRequest.get('tracks/trending/?limit=10');
    }

    async getPlaylists(){
        return await httpRequest.get('playlists');
    }
    
    async register(endpoint, data, options = {}){
        return await httpRequest.post(endpoint, data, options)
    }
    async login(endpoint, data, options = {}){
        return await httpRequest.post(endpoint, data, options)
    }
    async logout(endpoint, data, options = {}){
        return await httpRequest.post(endpoint, data, options)
    }
    async updateProfile(userID, data, options = {}){
        return await httpRequest.put(`admin/users/${userID}`, data, options)
    }

    // me
    async refeshToken(options = {}){
        return await httpRequest.post("auth/refresh-token", null, options);
    }

    // CURD Playlist
    async getPlaylistByID(playlistID, options){
        return await httpRequest.get(`playlists/${playlistID}`, options)
    }
    async getPlaylistTracks(playlistID, options){
        return await httpRequest.get(`playlists/${playlistID}/tracks`, options)
    }
    async createPlaylist(data, options){
        return await httpRequest.post(`playlists`, data, options)
    }
    async updatePlaylist(playlistID, data, options={}){
        return await httpRequest.put(`playlists/${playlistID}`, data, options)
    }
    async deletePlaylist(playlistID, options){
        return await httpRequest.del(`playlists/${playlistID}`, options)
    }
    async addTrackToPlaylist(playlistID, data, options = {}){
        return await httpRequest.post(`playlists/${playlistID}/tracks`, data, options)
    }
    async removeTrackFromPlaylist(playlistID, trackID, options={}){
        return await httpRequest.del(`playlists/${playlistID}/tracks/${trackID}`, options)
    }

    // Me Get
    async getFollowedArtists(options = {}){
        return await httpRequest.get("me/following", options)
    }
    async getMyPlaylists(options = {}){
        return await httpRequest.get("me/playlists", options)
    }
    async getFollowedPlaylists(options = {}){
        return await httpRequest.get("me/playlists/followed", options)
    }

    // Me patch
    async likedAlbum(albumID, options){
        return await httpRequest.patch(`albums/${albumID}/like`, null, options)
    }
    async followedArtist(artistID, options){
        return await httpRequest.post(`artists/${artistID}/follow`, null, options)
    }
    async unfollowedArtist(artistID, options){
        return await httpRequest.del(`artists/${artistID}/follow`, options)
    }


    async followedPlaylist(playlistID, options){
        return await httpRequest.post(`playlists/${playlistID}/follow`, null, options)
    }
    async unfollowedPlaylist(playlistID, options){
        return await httpRequest.del(`playlists/${playlistID}/follow`, options)
    }

    // Upload Img
    async uploadPlaylistCoverImg(playlistID, data, options= {}){
        return await httpRequest.postfile(`upload/playlist/${playlistID}/cover`, data, options);
    }
    async uploadAvatarImg(data, options= {}){
        return await httpRequest.postfile(`upload/avatar`, data, options);
    }
}

const helper = new Helper();

export default helper;