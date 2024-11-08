import axios from 'axios';

/**
 * General HTTP request function
 * @param {string} method - HTTP method (e.g., 'get', 'post', 'put', 'delete', 'patch')
 * @param {string} uri - API endpoint (without the base URL)
 * @param {object} data - Data payload for POST, PUT, PATCH, DELETE requests
 * @param {object} headers - Optional headers
 * @param {string} fullUrl - Optional full URL to override base URL and URI
 * @returns {Promise} - Axios Promise
 */
export function HTTP(method, uri, data = {}, headers = {}, fullUrl = null, config = {}) {
    return new Promise((resolve, reject) => {
        // Determine the URL, prioritizing fullUrl if provided
        console.log(process.env.REACT_APP_BASE_URL, "process.env.REACT_APP_BASE_URL",process.env.REACT_APP_X_API_KEY)
        const url = fullUrl || `${process.env.REACT_APP_BASE_URL}${uri}`.trim();

        const defaultHeaders = {
            'Content-Type': 'application/json',
            'x-api-key': process.env.REACT_APP_X_API_KEY, // Add X-API-KEY header
            ...headers
        };
        console.log(defaultHeaders, "defaultHeaders")
        // Configure Axios request
        const requestConfig = {
            method: method.toLowerCase(),
            url,
            headers: defaultHeaders,
            ...(method === 'post' || method === 'put' || method === 'delete' || method === 'patch' ? { data } : {}),
            ...config,
        };

        // Make Axios request
        axios(requestConfig)
            .then(response => resolve(response))
            .catch(error => reject(error));
    });
}
