import * as winston from "winston";
import { ProjectConfig } from "./ProjectConfigService";

declare const Promise: any;

export interface IConfigFetcher {
    fetchLogic(lastProjectConfig: ProjectConfig, callback: (newProjectConfig: ProjectConfig) => void): void;
}

export class HttpConfigFetcher implements IConfigFetcher {

    url: string;
    productVersion: string;
    logger: any;

    constructor(url: string, productVersion: string, logger?: winston.LoggerInstance) {
        this.url = url;
        this.productVersion = productVersion;
        this.logger = logger ? logger : winston;
    }

    fetchLogic(lastProjectConfig: ProjectConfig, callback: (newProjectConfig: ProjectConfig) => void): void {

        // tslint:disable-next-line:typedef
        var options = {
            url: this.url,
            headers: {
                "User-Agent": "ConfigCat-node/" + this.productVersion,
                "X-ConfigCat-UserAgent": "ConfigCat-node/" + this.productVersion,
                "If-None-Match": lastProjectConfig ? lastProjectConfig.HttpETag : null
            }
        };

        var httpClient = function() {
            this.get = function(aUrl, aCallback) {
                var anHttpRequest = new XMLHttpRequest();
                anHttpRequest.onreadystatechange = function() {
                    if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                        aCallback(anHttpRequest.responseText);
                };

                anHttpRequest.open( "GET", aUrl, true );
                anHttpRequest.send( null );
            }
        };

        var client = new httpClient();
        client.get(this.url, (response) => {
            callback(new ProjectConfig(new Date().getTime(), response, response.headers.etag));
        });

        // httprequest(options, (err, response, body) => {
        //
        //     if (!err && response.statusCode === 304) {
        //
        //         callback(new ProjectConfig(new Date().getTime(), lastProjectConfig.JSONConfig, response.headers.etag));
        //
        //     } else if (!err && response.statusCode === 200) {
        //
        //         callback(new ProjectConfig(new Date().getTime(), body, response.headers.etag));
        //
        //     } else {
        //
        //         if (err) {
        //             this.logger.error("httprequest error - " + err);
        //         }
        //
        //         callback(lastProjectConfig);
        //     }
        // });
    }


}

export default IConfigFetcher;