class HttpRequest{
    constructor(){
        this.baseUrl = "https://spotify.f8team.dev/api/";
    }

    async _send(endpoint, method, data, options = {}){
        try {
            const _customRequest = {
                ...options,
                method: method,
                headers: {
                    ...options.headers,
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": '*'
                }
            }
    
            if(data){
                _customRequest.body = JSON.stringify(data)
            }
            if(options.token){
                _customRequest.headers["Authorization"] = `Bearer ${options.token}`
            }

            const res = await fetch(`${this.baseUrl}${endpoint}`, _customRequest);
            if (!res.ok) {
                switch(res.status){
                    case 404:
                        throw new Error(" Not Found 404 ");
                    case 409:
                        throw new Error(" Already Had 409 ");
                    case 500:
                        throw new Error(" Server Error 500 ");
                    default:
                        throw new Error("HTTP error ", res.status);
                }
            }

            const response = await res.json();
            return response;
        } catch (error) {
            throw error;
        }
    }

    async get(endpoint, options = {}){
        return await this._send(endpoint, "GET", null, options);
    }

    async post(endpoint, data, options = {}){
        return await this._send(endpoint, "POST", data, options);
    }

    async put(endpoint, data, options = {}){
        return await this._send(endpoint, "PUT", data, options);
    }

    async patch(endpoint, data, options = {}){
        return await this._send(endpoint, "PATCH", data, options);
    }

    async del(endpoint, options = {}){
        return await this._send(endpoint, "DELETE", null, options);
    }

}

const httpRequest = new HttpRequest();

export default httpRequest;