function validate_book_fields(req, res, next){
    const { title, author, genre, publisher, publication_date } = req.body;

    if(!title || !author || !genre || !publisher || !publication_date){
        return res.status(400).json({ message: "Fields are empty" })
    }

    //regex to check for date format first
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(publication_date)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
    }

    //then after all that, check if the date is valid
    const date = new Date(publication_date);
    const [year, month, day] = publication_date.split('-').map(Number);

    if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
        return res.status(400).json({ message: "Invalid date: does not exist in the calendar." });
    }

    next();
}

module.exports = { validate_book_fields }