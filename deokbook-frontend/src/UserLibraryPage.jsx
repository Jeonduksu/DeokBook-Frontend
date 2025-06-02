import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";

const UserLibraryPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchField, setSearchField] = useState("title");
    const [sortField, setSortField] = useState("title");
    const [sortOrder, setSortOrder] = useState("asc");
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchBooks();
    }, [searchTerm, searchField, sortField, sortOrder, page]);

    const fetchBooks = async () => {
        const res = await axios.get("/api/books", {
            params: {
                searchTerm,
                searchField,
                sortField,
                sortOrder,
                page,
            },
        });
        setBooks(res.data.books);
        setTotalPages(res.data.totalPages);
    };

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-4">
            <h1 className="text-2xl font-bold">📚 도서 검색</h1>

            {/* 검색 및 정렬 영역 */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <Input
                    placeholder="검색어 입력"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select value={searchField} onValueChange={setSearchField}>
                    <SelectItem value="title">제목</SelectItem>
                    <SelectItem value="author">저자</SelectItem>
                    <SelectItem value="publisher">출판사</SelectItem>
                </Select>
                <Select value={sortField} onValueChange={setSortField}>
                    <SelectItem value="title">제목</SelectItem>
                    <SelectItem value="author">저자</SelectItem>
                    <SelectItem value="year">출간년도</SelectItem>
                </Select>
                <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectItem value="asc">오름차순</SelectItem>
                    <SelectItem value="desc">내림차순</SelectItem>
                </Select>
            </div>

            {/* 도서 목록 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {books.map((book) => (
                    <Card key={book.id} className="p-4">
                        <h2 className="font-semibold">{book.title}</h2>
                        <p className="text-sm text-gray-600">{book.author} | {book.publisher}</p>
                        <p className="text-sm">출간년도: {book.year}</p>
                        <p className={book.available ? "text-green-600" : "text-red-500"}>
                            {book.available ? "대출 가능" : "대출 불가"}
                        </p>
                    </Card>
                ))}
            </div>

            {/* 페이지네이션 */}
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
    );
};

export default UserLibraryPage;
