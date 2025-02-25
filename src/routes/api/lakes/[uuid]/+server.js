import { createConnection } from '$lib/db/mysql';

export async function GET({ params }) {
    const connection = await createConnection();
    const { uuid } = params;

    const [rows] = await connection.execute('SELECT * FROM lakes WHERE id = ?', [uuid]);
    await connection.end();

    if (rows.length === 0) {
        return new Response(JSON.stringify({ error: "Lake not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(rows[0]), {
        status: 200,
        headers: { 'content-type': 'application/json' }
    });
}

export async function PUT({ params, request }) {
    const connection = await createConnection();
    const { uuid } = params;
    const data = await request.json();

    // Ensure at least one field is provided
    const allowedFields = ['name', 'area', 'depth', 'elevation', 'type'];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
        if (data[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(data[field]);
        }
    }

    if (updates.length === 0) {
        return new Response(JSON.stringify({ error: "No data to update" }), { status: 400 });
    }

    values.push(uuid); // Add UUID to the values array for WHERE condition

    const query = `UPDATE lakes SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await connection.execute(query, values);

    await connection.end();

    if (result.affectedRows === 0) {
        return new Response(JSON.stringify({ error: "Lake not found" }), { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Lake updated successfully" }), { status: 200 });
}

export async function DELETE({ params }) {
    const connection = await createConnection();
    const { uuid } = params;

    const [result] = await connection.execute('DELETE FROM lakes WHERE id = ?', [uuid]);
    await connection.end();

    if (result.affectedRows === 0) {
        return new Response(JSON.stringify({ error: "Lake not found" }), { status: 404 });
    }

    return new Response(null, { status: 204 });
}