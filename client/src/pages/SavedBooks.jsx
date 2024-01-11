import { Button, Card, Col, Container, Row } from 'react-bootstrap'

import { useMutation, useQuery } from '@apollo/client'
import Auth from '../utils/auth'
import { removeBookId } from '../utils/localStorage'
import { REMOVE_BOOK } from '../utils/mutations'
import { QUERY_ME } from '../utils/queries'

const SavedBooks = () => {
	const { loading, data, error } = useQuery(QUERY_ME)
	const [deleteBook] = useMutation(REMOVE_BOOK)

	const userData = data?.me || {}
	// needed to check error, because data was undefined
	// "Cannot populate path 'book' because it is not in your schema"
	// changed the .populate('book') to .populate('savedBooks') in resolvers.js
	// to match the schema
	if (error) {
		console.error('Error fetching data:', error)
		return <h2>Error fetching data</h2>
	}
	// create function that accepts the book's mongo _id value as param and deletes the book from the database
	const handleDeleteBook = async (bookId) => {
		const token = Auth.loggedIn() ? Auth.getToken() : null

		if (!token) {
			return false
		}

		try {
			await deleteBook({
				variables: { bookId }
			})

			// upon success, remove book's id from localStorage
			removeBookId(bookId)
		} catch (err) {
			console.error(err)
		}
	}

	// if data isn't here yet, say so
	if (loading) {
		return <h2>LOADING...</h2>
	}

	return (
		<>
			<div className='text-light bg-dark p-5'>
				<Container>
					<h1>Viewing saved books!</h1>
				</Container>
			</div>
			<Container>
				<h2 className='pt-5'>
					{userData.savedBooks.length
						? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
						: 'You have no saved books!'}
				</h2>
				<Row>
					{userData.savedBooks.map((book) => {
						return (
							<Col key={book.bookId} md='4'>
								<Card border='dark'>
									{book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
									<Card.Body>
										<Card.Title>{book.title}</Card.Title>
										<p className='small'>Authors: {book.authors}</p>
										<Card.Text>{book.description}</Card.Text>
										<Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
											Delete this Book!
										</Button>
									</Card.Body>
								</Card>
							</Col>
						)
					})}
				</Row>
			</Container>
		</>
	)
}

export default SavedBooks
