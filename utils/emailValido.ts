
export = function emailValido(email: string): boolean {
	if (!email)
		return false;

	const arroba = email.indexOf("@");
	const arroba2 = email.lastIndexOf("@");
	const ponto = email.lastIndexOf(".");

	return (arroba > 0 && ponto > (arroba + 1) && ponto !== (email.length - 1) && arroba2 === arroba);
}
