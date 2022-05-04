import { AdminWebsocket, AppWebsocket } from "@holochain/client"
import * as path from 'path'

const adminPort = 3333
const appPort = 4444
const signalCb = () => { }


switch (process.argv[2]) {
    case 'i':
        await install()
        console.log('install complete')
        break
    case 'c':
        await create(parseInt(process.argv[3], 10))
        console.log('create complete')
        break
    case 'l':
        await list()
        console.log('list complete')
        break
}

async function install() {
    const adminClient = await AdminWebsocket.connect(`ws://localhost:${adminPort}`, 12000, signalCb)
    let agent_key = await adminClient.generateAgentPubKey()
    try {
        await adminClient.uninstallApp({
            installed_app_id: 'app',
        })
        console.log("uninstalled app")
    } catch (e) { }
    await adminClient.installAppBundle({
        agent_key,
        installed_app_id: 'app',
        path: path.resolve('../dna/simple.happ'),
        membrane_proofs: {}
    })
    console.log("installed app")
    try {
        await adminClient.attachAppInterface({
            port: appPort
        })
        console.log("attached app interface")
    } catch (e) { }
    adminClient.client.close()
}

async function create(num) {
    num = num || 1
    const adminClient = await AdminWebsocket.connect(`ws://localhost:${adminPort}`, 12000, signalCb)
    await adminClient.enableApp({ installed_app_id: 'app' })
    const client = await AppWebsocket.connect(`ws://localhost:${appPort}`, 12000, signalCb)
    const info = await client.appInfo({ installed_app_id: 'app' })
    console.log(info)
    const cell_id = info.cell_data[0].cell_id;

    const payload = []
    for (let i = 0; i < num; i++) {
        payload.push(Math.floor(Math.random() * (2 ** 31)))
    }

    await client.callZome({
        cap: null,
        cell_id,
        zome_name: "simple",
        fn_name: 'create',
        provenance: cell_id[1],
        payload,
    }, 30000)
    adminClient.client.close()
    client.client.close()
}

async function list() {
    const adminClient = await AdminWebsocket.connect(`ws://localhost:${adminPort}`, 12000, signalCb)
    await adminClient.enableApp({ installed_app_id: 'app' })
    const client = await AppWebsocket.connect(`ws://localhost:${appPort}`, 12000, signalCb)
    const info = await client.appInfo({ installed_app_id: 'app' })
    console.log(info)
    const cell_id = info.cell_data[0].cell_id;
    const list = await client.callZome({
        cap: null,
        cell_id,
        zome_name: "simple",
        fn_name: 'list',
        provenance: cell_id[1],
        payload: null,
    }, 30000)
    list.items.sort((a, b) => a - b);
    adminClient.client.close()
    client.client.close()
    console.log(JSON.stringify(list, null, 2))
}
