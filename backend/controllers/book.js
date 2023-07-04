const Book = require('../models/books');
const fs = require('fs');
const sharp = require('sharp');


exports.createBook = async (req, res, next) => {
	try {
	  console.log(req.body);
	  const bookObject = JSON.parse(req.body.book);
	  delete bookObject._id;
	  delete bookObject._userId;
	  const book = new Book({
		...bookObject,
		userId: req.auth.userId,
		imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.compressedFilename}`,
	  });
  
	  const newFilePath = req.file.compressedFilePath;
  
	  book.imageUrl = `${req.protocol}://${req.get('host')}/${newFilePath}`;
  
	  await book.save();
  
	  res.status(201).json({ message: 'Objet enregistré !' });
	} catch (error) {
	  console.error('Une erreur s\'est produite lors du redimensionnement de l\'image :', error);
	  res.status(500).json({ error: 'Erreur lors du traitement de l\'image' });
	}
};

exports.getOneBook = (req, res, next) => {
	Book.findOne({
		_id: req.params.id,
	})
		.then((book) => {
			res.status(200).json(book);
		})
		.catch((error) => {
			res.status(404).json({
				error: error,
			});
		});
};
exports.modifyBook = async (req, res, next) => {
	try {
	  const bookObject = req.file
		? {
			...JSON.parse(req.body.book),
			imageUrl: `${req.protocol}://${req.get('host')}/images/resized_${req.file.compressedFilename}`,
		  }
		: { ...req.body };
	  delete bookObject._userId;
  
	  const book = await Book.findOne({ _id: req.params.id });
	  if (book.userId != req.auth.userId) {
		return res.status(401).json({ message: 'Not authorized' });
	  }
  
	  if (req.file) {
		// Supprimer l'image précédente si un fichier a été téléchargé
		const previousImagePath = book.imageUrl.split('/images/')[1];
		if (previousImagePath) {
		  fs.unlink(`images/${previousImagePath}`, (error) => {
			if (error) {
			  console.log('Failed to delete previous image:', error);
			}
		  });
		}
  
		const newFilePath = `images/resized_${req.file.compressedFilename}`;
  
		bookObject.imageUrl = `${req.protocol}://${req.get('host')}/${newFilePath}`;
	  }
  
	  await Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id });
  
	  res.status(200).json({ message: 'Objet modifié!' });
	} catch (error) {
	  console.error('Une erreur s\'est produite lors de la modification du livre :', error);
	  res.status(500).json({ error: 'Erreur lors de la modification du livre' });
	}
  };

exports.deleteBook = (req, res, next) => {
	Book.findOne({ _id: req.params.id })
		.then((book) => {
			if (book.userId != req.auth.userId) {
				res.status(401).json({ message: 'Not authorized' });
			} else {
				const filename = book.imageUrl.split('/images/')[1];
				fs.unlink(`images/${filename}`, () => {
					Book.deleteOne({ _id: req.params.id })
						.then(() => {
							res.status(200).json({ message: 'Objet supprimé !' });
						})
						.catch((error) => res.status(401).json({ error }));
				});
			}
		})
		.catch((error) => {
			res.status(500).json({ error });
		});
};

exports.getAllBook = (req, res, next) => {
	Book.find()
		.then((books) => {
			res.status(200).json(books);
		})
		.catch((error) => {
			res.status(400).json({
				error: error,
			});
		});
};

exports.addRating = (req, res, next) => {
	// Validating rating param
	if(req.body.rating < 0 || req.body.rating > 5) {
		return res.status(400).json({ error: "La note doit être un nombre entre 0 et 5." });
	}
	// Validating userId param
	if(req.body.userId !== req.auth.userId) {
		return res.status(401).json({ message: "Vous ne pouvez voter que pour votre propre compte" });
	}
	// Loading book from database
	Book.findOne({ _id: req.params.id })
	.then((book) => {
		// Adding the new grade to the loaded book
		book.ratings.push({userId: req.body.userId, grade: req.body.rating});
		// Adding the new average to the loaded book
		let averageRates = 0;
		for (let i = 0; i < book.ratings.length; i++) {
			averageRates += book.ratings[i].grade;
		}
		averageRates /= book.ratings.length;
		book.averageRating = averageRates;
		// Saving book in the database
		book.save().then(book => {
			res.status(200).json(book);
		})
		.catch(error => {
			res.status(500).json({ error });
		});
	})
	.catch((error) => {
		res.status(500).json({ error });
	});
};

exports.getBestRating = (req, res, next) => {
	// Getting all books from database
	Book.find()
	.sort({ averageRating: -1 })
	.limit(3)
	.then(books => res.status(200).json(books))
	.catch(error => res.status(400).json({ error }));
};
