
import { Component, JsonObject, IHash, Config, Json } from "merapi";
import { v4 as uuid } from "uuid";
import { ICompile, IHelper, ITester } from "interfaces/main";
const colors = require("colors");
const inquirer = require("inquirer");
const repl = require("repl");
const util = require("util");
const deasync = require("deasync");
const Table = require("cli-table");

export default class Bot extends Component {
    constructor(private compile: ICompile, private helper: IHelper, private tester: ITester, private api: any) {
        super();
    }

    public init(name: string, version: string, options: JsonObject) {
        if (version) {
            const versionRegex = /^\d+\.\d+\.\d+$/g;
            if (!versionRegex.test(version)) {
                console.log("Invalid version string");
                console.log("Command kata init <botId> <botName> [version] is deprecated, use kata init <botName> [version] instead");
                process.exit(0);
            }
        }

        if (!version) {
            version = "0.0.1";
        }

        const botDesc = {
            schema: "kata.ai/schema/kata-ml/1.0",
            name,
            desc: "My First Bot",
            version: version || "0.0.1",
            flows: {
                hello: {
                    fallback: true,
                    intents: {
                        greeting: {
                            initial: true,
                            condition: "content == 'hi'"
                        },
                        fallback: {
                            fallback: true
                        }
                    },
                    states: {
                        init: {
                            initial: true,
                            transitions: {
                                greet: {
                                    condition: "intent == \"greeting\""
                                },
                                other: {
                                    fallback: true
                                }
                            }
                        },
                        greet: {
                            end: true,
                            action: {
                                name: "text",
                                options: {
                                    text: "hi!"
                                }
                            }
                        },
                        other: {
                            end: true,
                            action: {
                                name: "text",
                                options: {
                                    text: "sorry!"
                                }
                            }
                        }
                    }
                }
            }
        };

        this.helper.dumpYaml("./bot.yml", botDesc);

        console.log(`Initialized ${name} successfully`);
    }

    public async versions(options: JsonObject) {
        try {
            const botId = this.helper.getBotId();

            if (!botId) {
                throw new Error("BOT ID HAS NOT DEFINED");
            }
            const { data, response } = await this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdVersionsGet, botId);
            if (data.versions) {
                const history = data.versions;
                console.log("Bot Versions : ");
                history.data.forEach((hist: JsonObject) => {
                    if (hist.tag) {
                        console.log(`- ${hist.version} (${hist.tag})`);
                    } else {
                        console.log(`- ${hist.version}`);
                    }
                });
            } else {
                console.log("You must push at least 1 bot to acquire version");
            }
        } catch (e) {
            if (e.code === "ENOENT") {
                console.log("kata versions must be executed in bot directory with bot.yml");
            } else {
                console.log(this.helper.wrapError(e));
            }
        }
    }

    public async test(file: string, options: JsonObject) {
        const testFiles = file ? [file] : this.helper.getFiles("./test", ".spec.yml");
        const botId = this.helper.getBotId();

        if (!botId) {
            throw new Error("BOT ID HAS NOT DEFINED");
        }

        const results: JsonObject = {};

        for (let i = 0; i < testFiles.length; i++) {
            const yaml = this.helper.loadYaml(testFiles[i]);
            let res;

            switch (yaml.schema) {
                case "kata.ai/schema/kata-ml/1.0/test/intents":
                    res = await this.tester.execIntentTest(yaml, this.api.botApi, botId, console.log);
                    if (this.hasErrors(res)) {
                        results[testFiles[i]] = res;
                    }
                    break;
                case "kata.ai/schema/kata-ml/1.0/test/states":
                    res = await this.tester.execStateTest(yaml, this.api.botApi, botId, console.log);
                    if (this.hasErrors(res)) {
                        results[testFiles[i]] = res;
                    }
                    break;
                case "kata.ai/schema/kata-ml/1.0/test/actions":
                    res = await this.tester.execActionsTest(yaml, this.api.botApi, botId, console.log);
                    if (this.hasErrors(res)) {
                        results[testFiles[i]] = res;
                    }
                    break;
                case "kata.ai/schema/kata-ml/1.0/test/flow":
                    res = await this.tester.execFlowTest(yaml, this.api.botApi, botId, console.log);
                    if (this.hasErrors(res)) {
                        results[testFiles[i]] = res;
                    }
                    break;
            }
        }

        this.printResult(results as IHash<IHash<{ field: string, expect: string, result: string }[]>>);
    }

    private hasErrors(res: any) {
        return Object.keys(res).some((key) => (res[key] && res[key].length) || res[key] === null);
    }

    private printResult(results: IHash<IHash<{ field: string, expect: string, result: string }[]>> = {}) {
        if (Object.keys(results).length) {
            console.log(colors.red("Errors:"));
            for (const i in results) {
                console.log(`    ${i}:`);
                for (const j in results[i]) {
                    if (!results[i][j]) {
                        console.log(`        ${colors.red(j + ":")}`);
                        console.log(`            diaenne returns ${colors.red("null")}`);
                        continue;
                    }
                    if (results[i][j].length) {
                        console.log(`        ${colors.red(j + ":")}`);

                        results[i][j].forEach((res) => {
                            console.log(`            expecting ${res.field} to be ${colors.green(res.expect)} but got ${colors.red(res.result)}`);
                        });
                    }
                }
            }
        }
    }

    public async list(options: JsonObject) {
        try {
            const { data, response } = await this.helper.toPromise(this.api.botApi, this.api.botApi.botsGet, {});
            const table = new Table({
                head: ["Bot ID", "Bot Name", "Version", "Description"]
                , colWidths: [20, 20, 10, 20]
            });
            data.items.forEach((bot: { id: string, name: string, version: string, desc: string }) => {
                table.push([bot.id, bot.name, bot.version, bot.desc]);
            });
            console.log(table.toString());
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    public async update(options: JsonObject) {
        const desc = this.helper.loadYaml("./bot.yml");

        const oldVersion = desc.version;
        let [major, minor, patch] = (desc.version as string).split(".").map((val: string) => parseInt(val));

        switch (options.rev) {
            case "major":
                ++major;
                minor = 0;
                patch = 0;
                break;
            case "minor":
                ++minor;
                patch = 0;
                break;
            case "patch":
                ++patch;
                break;
        }

        if (major === undefined || minor === undefined || patch === undefined) {
            major = major || 0;
            minor = minor || 0;
            patch = patch || 0;
        }

        desc.version = `${major}.${minor}.${patch}`;
        desc.tag = options.tag || null;

        let bot = Config.create(desc, { left: "${", right: "}" });
        bot = this.compile.execDirectives(bot, process.cwd());
        bot.resolve();

        const botDesc = bot.get();
        botDesc.name = botDesc.name || "bot";

        if (options.draft) {
            await this.updateDraft(botDesc, desc);
            return;
        }

        if (!botDesc.id) {
            const id = uuid();
            botDesc.id = id;
            desc.id = id;

            try {
                const result = await this.helper.toPromise(this.api.botApi, this.api.botApi.botsPost, botDesc);
                console.log(`BOT CREATED SUCCESSFULLY WITH VERSION ${desc.version}`);
            } catch (e) {
                desc.version = oldVersion;

                console.log(this.helper.wrapError(e));
            }
        } else {
            try {
                const result = await this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdPut, botDesc.id, botDesc, {});
                desc.version = result.data.version;

                console.log(`UPDATED BOT SUCCESSFULLY WITH VERSION ${desc.version}`);
            } catch (e) {
                desc.version = oldVersion;

                console.log(this.helper.wrapError(e));
            }
        }

        this.helper.dumpYaml("./bot.yml", desc);
    }

    public async discardDraft(botDesc: JsonObject, desc: JsonObject): Promise<void> {
        try {
            desc.tag = null;
            await this.helper.toPromise(this.api.draftApi, this.api.draftApi.botsBotIdDraftDelete, botDesc.id);
            console.log("Draft discarded.");
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
        this.helper.dumpYaml("./bot.yml", desc);
    }

    public async discard(options: JsonObject): Promise<void> {
        const desc = this.helper.loadYaml("./bot.yml");

        let bot = Config.create(desc, { left: "${", right: "}" });
        bot = this.compile.execDirectives(bot, process.cwd());
        bot.resolve();

        const botDesc = bot.get();

        if (options.draft) {
            await this.discardDraft(botDesc, desc);
            return;
        }
        return;
    }

    public async updateDraft(botDesc: JsonObject, desc: JsonObject): Promise<void> {
        botDesc.id = botDesc.id || uuid();

        try {
            await this.helper.toPromise(this.api.draftApi, this.api.draftApi.botsBotIdDraftPost, botDesc.id, botDesc);
            desc.tag = "draft";
            botDesc.tag = "draft";
            console.log("Draft updated.");
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }

        this.helper.dumpYaml("./bot.yml", desc);
    }

    public async delete(options: JsonObject) {
        const answer = await this.helper.inquirerPrompt([
            {
                type: "confirm",
                name: "confirmation",
                message: "Are you sure to delete this bot?",
                default: false
            }
        ]);

        if (!answer.confirmation) {
            return;
        }

        const botId = this.helper.getBotId();

        try {
            const { data } = await this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdDelete, botId);

            console.log("REMOVE BOT SUCCESSFULLY");
        } catch (e) {
            console.log(this.helper.wrapError(e));
        }
    }

    public console(options: JsonObject) {
        let currentSession = (options.session ? options.session : uuid()) as string;
        let botDesc;
        try {
            botDesc = this.helper.loadYaml("./bot.yml");
        } catch (error) {
            console.log(this.helper.wrapError(error));
            return;
        }

        const botId = botDesc.id;
        const defaultDeploymentId = "f223c9e0-6ba1-434d-8313-a9f18ca364bd";

        const con = repl.start({
            prompt: botDesc.name + ">",
            writer(obj: any) {
                return util.inspect(obj, false, null, true);
            }
        });

        con.context.text = function text(str: string) {
            const message = {
                type: "text",
                content: str
            };
            const body = {
                sessionId: currentSession,
                message
            };

            try {
                const { data } = this.sync(this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdConversePost, botId, body));

                return data;
            } catch (e) {
                return this.helper.wrapError(e);
            }
        }.bind(this);

        con.context.button = function button(op: JsonObject, obj: JsonObject = {}) {
            obj.op = op;
            const message = {
                type: "data",
                payload: obj
            };
            const body = {
                sessionId: currentSession,
                message
            };

            try {
                const { data } = this.sync(this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdConversePost, botId, body));

                return data;
            } catch (e) {
                return this.helper.wrapError(e);
            }
        }.bind(this);

        con.context.command = function button(command: string, obj: JsonObject = {}) {
            const message = {
                type: "command",
                content: command,
                payload: obj
            };
            const body = {
                sessionId: currentSession,
                message
            };

            try {
                const { data } = this.sync(this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdConversePost, botId, body));

                return data;
            } catch (e) {
                return this.helper.wrapError(e);
            }
        }.bind(this);

        con.context.current = function (session: string) {
            if (arguments.length) {
                currentSession = session;
            } else {
                return currentSession;
            }
        }.bind(this);

        con.context.session = function session(name: string, update: JsonObject) {
            try {
                if (!arguments.length) {
                    const res = this.sync(this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdGet, botId, defaultDeploymentId, currentSession, "get"));

                    return res.data;
                } else if (arguments.length === 1) {
                    const res = this.sync(this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdGet, botId, defaultDeploymentId, name, "get"));

                    return res.data;
                } else {
                    let res = this.sync(this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdGet, botId, defaultDeploymentId, currentSession, "getOrCreate"));
                    const session = res.data;
                    res = this.sync(this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdPut, botId, defaultDeploymentId, session.id, update));

                    return res.data;
                }
            } catch (e) {
                return this.helper.wrapError(e);
            }
        }.bind(this);

        con.context.clear = function clear(name: string) {
            name = name || currentSession;

            try {
                const { data } = this.sync(this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdGet, botId, defaultDeploymentId, name, "get"));
                const session = { ...data };

                if (session) {
                    this.sync(this.helper.toPromise(this.api.sessionApi, this.api.sessionApi.botsBotIdDeploymentsDeploymentIdSessionsSessionIdDelete, botId, defaultDeploymentId, session.id));
                }
            } catch (e) {

                if (e.status !== 400) {
                    return;
                }

                return this.helper.wrapError(e);
            }
        }.bind(this);

        con.context.clearCaches = function clearCaches(num: number = 20) {
            try {
                for (let i = 0; i < num; i++) {
                    this.sync(this.helper.toPromise(this.api.cachesApi, this.api.cachesApi.cachesDelete));
                }
            } catch (e) {
                return this.helper.wrapError(e);
            }
        }.bind(this);
    }

    public async pull(name: string, version: string, options: JsonObject) {
        let isGettingBot = false;
        try {
            const { data, response } = await this.helper.toPromise(this.api.botApi, this.api.botApi.botsGet, {});
            let found = false;
            let selectedBot: any;
            for (const bot of data.items) {
                const botName = bot.name;
                if (botName === name) {
                    found = true;
                    selectedBot = bot;
                    break;
                }
            }
            if (found) {
                // Get specific bot version
                isGettingBot = true;
                const botId = selectedBot.id + ":" + version;
                const getBot = await this.helper.toPromise(this.api.botApi, this.api.botApi.botsBotIdGet, botId);
                const botDesc = getBot.data;
                this.helper.dumpYaml("./bot.yml", botDesc);
                console.log(`SUCCESS PULL BOT ${name} WITH VERSION ${version}`);
            } else {
                console.log(`BOT NOT FOUND`);
            }
        } catch (e) {
            if (isGettingBot) {
                console.log(`CANNOT PULL BOT ${name} WITH VERSION ${version}`);
            } else {
                console.log(this.helper.wrapError(e));
            }
        }
    }

    private sync(promise: any) {
        if (promise && typeof promise.then === "function") {
            let done = false;
            let error: Error = null;
            let result;

            promise.then((res: any) => {
                done = true;
                result = res;
            }).catch((e: Error) => {
                error = e;
            });

            deasync.loopWhile(() => {
                return !done && !error;
            });

            if (error) {
                throw error;
            }

            return result;
        }


        throw new Error("Sync only accept promises");
    }
}
