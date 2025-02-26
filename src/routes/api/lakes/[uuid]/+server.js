import { createConnection } from '$lib/db/mysql';
import { BASIC_AUTH_USER, BASIC_AUTH_PASSWORD } from '$env/static/private';

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

async function authenticate(request) {
	const auth = request.headers.get('authorization');
	if (!auth || auth !== `Basic ${btoa(`${BASIC_AUTH_USER}:${BASIC_AUTH_PASSWORD}`)}`) {
		return new Response(null, {
			status: 401,
			headers: { 'www-authenticate': 'Basic realm="Lakes API"' }
		});
	}

	const base64Credentials = auth.split(' ')[1];
	const credentials = atob(base64Credentials);
	const [username, password] = credentials.split(':');

	if (username !== BASIC_AUTH_USER || password !== BASIC_AUTH_PASSWORD) {
		return new Response(JSON.stringify({ message: 'Access denied' }), {
			status: 401,
			headers: { 'www-authenticate': 'Basic realm="Lakes API"' }
		});
	}

	return null;
}

export async function PUT({ params, request }) {
	const authResponse = await authenticate(request);
	if (authResponse) return authResponse;

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

export async function DELETE({ params, request }) {
	const authResponse = await authenticate(request);
	if (authResponse) return authResponse;

	const connection = await createConnection();
	const { uuid } = params;

	await connection.execute('DELETE FROM lakes WHERE id = ?', [uuid]);
	await connection.end();

	return new Response(null, { status: 204 });
}