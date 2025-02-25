import { createConnection } from '$lib/db/mysql';

export async function GET({ params }) {
	const connection = await createConnection();
	const { uuid } = params;

	const [rows] = await connection.execute('SELECT * FROM lakes WHERE id = ?', [uuid]);
	await connection.end();

	return new Response(JSON.stringify(rows[0]), {
		status: 200,
		headers: { 'content-type': 'application/json' }
	});
}

export async function PUT({ params, request }) {
	const connection = await createConnection();
	const { uuid } = params;
	const data = await request.json();

	await connection.execute(
		`UPDATE lakes 
         SET name = COALESCE(?, name), 
             area = COALESCE(?, area), 
             depth = COALESCE(?, depth), 
             elevation = COALESCE(?, elevation), 
             type = COALESCE(?, type) 
         WHERE id = ?`,
		[
			data.name ?? null,
			data.area ?? null,
			data.depth ?? null,
			data.elevation ?? null,
			data.type ?? null,
			uuid
		]
	);

	await connection.end();

	return new Response(JSON.stringify(data), {
		status: 200,
		headers: { 'content-type': 'application/json' }
	});
}

export async function DELETE({ params }) {
	const connection = await createConnection();
	const { uuid } = params;

	const [result] = await connection.execute('DELETE FROM lakes WHERE id = ?', [uuid]);
	await connection.end();

	return new Response(null, { status: 204 });
}