import Layout from "~/components/Layout.jsx";
import type { ElysiaApp } from "~/index.js";



export default (app: ElysiaApp) => app.get("/", () => (
    <Layout>
        <h1>Hello</h1>
    </Layout>
));
