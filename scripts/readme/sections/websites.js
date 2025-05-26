import {Section} from "../section.js";

export class Sites extends Section {


    static marks = {
        ok: "🟩",
        warn: "🟨",
        error: "🟥"
    }

    static list = [

        {
            url: "https://leafcat.live",
            name: "Personal Website",
            description: "My personal website",
            link: "https://beepsterr.com"
        },

        {
            url: "https://pictoask.net",
            name: "PictoASK!",
            description: "A Q&A Website with a twist!",
            link: "https://pictoask.net"
        },

        {
            url: "https://barking.party",
            name: "BlueSky Handle Registrar",
            description: "Claim a funny or neat bluesky handle from a set of my domains!",
            link: "https://barking.party"
        },
        

    ]

    results = [];

    async fetchData() {

        for (const site of Sites.list) {
            let x = performance.now();
            try{
                let response = await fetch(site.url);
                let y = performance.now();
                this.results.push({
                    site: site,
                    response: response,
                    time: y-x
                })

            }catch(ex){
                let y = performance.now();
                this.results.push({
                    site: site,
                    ok: false,
                    time: y-x
                })
            }
        }

        return await this.build();
    }

    async build(){

        const replacements = [];

        for(let result of this.results){

            const site = result.site;
            const time = result.time.toLocaleString(undefined, { maximumFractionDigits: 0 });

            if(!result.response){
                replacements.push(`#### ${Sites.marks.error} ${site.name}\n\n${site.description}`);
            }else{

                const response = result.response;

                if(response.ok){
                    replacements.push(`#### [${Sites.marks.ok} ${site.name}](${site.link})\n\n${site.description}`);
                }else{
                    replacements.push(`#### [${Sites.marks.warn} ${site.name}](${site.link}) \`${response.status} - ${response.statusText}\`\n\n${site.description}`);
                }


            }

        }

        return replacements;

    }

    async getReplacementContext() {

                await this.fetchData();
        return  await this.build();

    }
}
