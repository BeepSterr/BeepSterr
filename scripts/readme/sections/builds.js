import {Section} from "../section.js";
import {Octokit} from "octokit";
import moment from "moment";

export class Builds extends Section {

    static octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    static repos = [
        {
            owner: 'BeepSterr',
            repo: 'BetterKeepInventory'
        }
    ];


    getArtifactUrl(repo, release, asset){
        // If an asset is present return its browser download url, otherwise fall back to the release page
        if(asset && asset.browser_download_url) return asset.browser_download_url;
        if(release && release.html_url) return release.html_url;
        return `https://github.com/${repo.owner}/${repo.repo}`;
    }

    async getReplacementContext() {

        const builds = [];
        for(let repo of Builds.repos){
            const repo_id = `${repo.owner}/${repo.repo}`;
            const repo_url = `https://github.com/${repo.owner}/${repo.repo}`;

            try{
                const response = await Builds.octokit.rest.repos.getLatestRelease({ ...repo });
                const release = response.data;

                // pick a downloadable asset if available
                const asset = (release.assets && release.assets.length > 0) ? release.assets[0] : null;
                const artifact_url = this.getArtifactUrl(repo, release, asset);
                const time_of_release = release.published_at ? moment(release.published_at).fromNow() : 'Unknown time';

                const downloadText = asset ? `
\n\`${time_of_release}\` [Download ${asset.name}](${artifact_url})` : `\n\`${time_of_release}\` [View Release](${artifact_url})`;

                builds.push(`### [${repo_id}](${repo_url})${downloadText}`);

            }catch(err){
                // 404 = no releases
                if(err && err.status === 404){
                    console.warn("No releases found for ", repo);
                    builds.push(`### [${repo_id}](${repo_url})\n\nNo releases available.`)
                }else{
                    console.error(err);
                    builds.push(`### [${repo_id}](${repo_url})\n\nRelease information unavailable.`)
                }
            }

        }

        return builds
    }
}
