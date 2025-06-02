// src/pages/MainPage.js
import React from 'react';

const books = [
    { id: 1, title: 'React 입문', author: '홍길동', cover: 'https://via.placeholder.com/120x180?text=React' },
    { id: 2, title: 'JavaScript 완전 정복', author: '김철수', cover: 'https://via.placeholder.com/120x180?text=JS' },
    { id: 3, title: 'CSS 디자인', author: '이영희', cover: 'https://via.placeholder.com/120x180?text=CSS' },
    { id: 4, title: 'Node.js 마스터', author: '박민수', cover: 'https://via.placeholder.com/120x180?text=Node' },
    // 더 추가 가능
];

function MainPage() {
    return (
        <div style={{
            maxWidth: '960px',
            margin: '2rem auto',
            fontFamily: "'Noto Serif KR', serif",
            color: '#333',
            padding: '0 1rem',
        }}>
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', letterSpacing: '0.1em' }}>📚 DeokBook 도서관</h1>
                <p style={{ fontSize: '1.1rem', color: '#666' }}>
                    오늘의 추천 도서와 인기 도서를 만나보세요.
                </p>
            </header>

            <section style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))',
                gap: '1.5rem',
            }}>
                {books.map(book => (
                    <div key={book.id} style={{
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                        borderRadius: '6px',
                        backgroundColor: '#fafafa',
                        padding: '1rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease-in-out',
                    }}
                         onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                         onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <img src={book.cover} alt={book.title} style={{ width: '120px', height: '180px', borderRadius: '4px', marginBottom: '0.75rem' }} />
                        <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.3rem' }}>{book.title}</h3>
                        <p style={{ fontSize: '0.9rem', color: '#555', margin: 0 }}>{book.author}</p>
                    </div>
                ))}
            </section>
        </div>
    );
}

export default MainPage;
