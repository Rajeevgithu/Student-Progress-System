const crypto = require('crypto');

class CodeforcesAPI {
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.baseUrl = 'https://codeforces.com/api';
    }

    generateApiSig(methodName, params) {
        // Generate random 6 characters
        const rand = Math.random().toString(36).substring(2, 8);
        
        // Sort parameters lexicographically
        const sortedParams = Object.entries(params)
            .sort(([keyA, valueA], [keyB, valueB]) => {
                if (keyA !== keyB) return keyA.localeCompare(keyB);
                return valueA.localeCompare(valueB);
            });

        // Create parameter string
        const paramString = sortedParams
            .map(([key, value]) => `${key}=${value}`)
            .join('&');

        // Create string to hash
        const stringToHash = `${rand}/${methodName}?${paramString}#${this.apiSecret}`;
        
        // Generate SHA-512 hash
        const hash = crypto.createHash('sha512').update(stringToHash).digest('hex');
        
        return rand + hash;
    }

    async makeRequest(methodName, params = {}) {
        const timestamp = Math.floor(Date.now() / 1000);
        
        // Add required parameters
        const requestParams = {
            ...params,
            apiKey: this.apiKey,
            time: timestamp
        };

        // Generate API signature
        const apiSig = this.generateApiSig(methodName, requestParams);
        requestParams.apiSig = apiSig;

        // Build URL with parameters
        const queryString = Object.entries(requestParams)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');
        
        const url = `${this.baseUrl}/${methodName}?${queryString}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === 'FAILED') {
                throw new Error(data.comment || 'API request failed');
            }
            
            return data.result;
        } catch (error) {
            console.error('Codeforces API Error:', error);
            throw error;
        }
    }

    // Example method to get user info
    async getUserInfo(handle) {
        return this.makeRequest('user.info', { handles: handle });
    }
}

module.exports = CodeforcesAPI; 