import { createConnection } from '$lib/db/mysql';

export async function GET() {
    const connection = await createConnection();
    const [rows] = await connection.execute('SELECT * FROM lakes');
    await connection.end();

    return new Response(JSON.stringify(rows), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    });
}

export async function POST({ request }) {
    const connection = await createConnection();
    const data = await request.json();

    if (!data.name || !data.area || !data.depth || !data.elevation || !data.type) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    await connection.execute(
        'INSERT INTO lakes (name, area, depth, elevation, type) VALUES (?, ?, ?, ?, ?)',
        [data.name, data.area, data.depth, data.elevation, data.type]
    );

    await connection.end();

    return new Response(JSON.stringify(data), {
        status: 201,
        headers: { 'content-type': 'application/json' }
    });
}