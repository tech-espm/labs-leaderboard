
export = function dataISOValida(data: string): boolean {
	if (!data)
		return false;

	const sep1 = data.indexOf("-");
	const sep2 = data.lastIndexOf("-");
	const sepChk = data.indexOf("-", sep1 + 1);
	if (sep1 <= 0 || sep2 <= sep1 || sepChk !== sep2)
		return false;
	const ano = parseInt(data.substring(0, sep1));
	const mes = parseInt(data.substring(sep1 + 1, sep2));
	const dia = parseInt(data.substring(sep2 + 1));
	return (ano >= 0 && mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31);
}
