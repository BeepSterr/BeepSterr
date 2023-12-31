import {Section} from "../section.js";
import {Octokit} from "octokit";
import moment from "moment";

export class Builds extends Section {

    static octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    static repos = [
        {
            owner: 'Awoo-industries',
            repo: 'BetterKeepInventory',
            workflow_id: "build.yml"
        },
        {
            owner: 'Awoo-industries',
            repo: 'FiniteNetherite',
            workflow_id: "build.yml"
        }
    ];


    getArtifactUrl(repo, run, id){
        return
    }

    async getReplacementContext() {

        const builds = [];
        for(let repo of Builds.repos){

            const response_run = await Builds.octokit.rest.actions.listWorkflowRunsForRepo({
                ...repo,
                per_page: 1
            });

            const response_artifact = await Builds.octokit.rest.actions.listWorkflowRunArtifacts({
                ...repo,
                per_page: 1,
                run_id: response_run.data.workflow_runs[0].id
            });

            const repo_id = `${repo.owner}/${repo.repo}`
            const repo_url = `https://github.com/${repo.owner}/${repo.repo}`
            
            const run = response_run.data.workflow_runs[0];
            const artifact = response_artifact.data.artifacts[0];
            
            if(run && artifact){
                const artifact_url = `${repo_url}/suites/${run.check_suite_id}/artifacts/${artifact.id}`
                const time_of_build = moment(artifact.created_at).fromNow();
                builds.push(`### [${repo_id}](${repo_url})\n\n\`${time_of_build}\` [Download Build](${artifact_url})`)
            }else{
                builds.push(`### [${repo_id}](${repo_url})\n\n\Build unavailable...`)
            }


        }

        return builds
    }
}
