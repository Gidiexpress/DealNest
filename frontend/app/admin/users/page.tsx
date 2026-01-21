"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import api from "@/lib/api"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Loader2, Settings } from "lucide-react"

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        api.get('/admin/users/')
            .then(res => setUsers(res.data))
            .finally(() => setLoading(false))
    }, [])

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Oversee and moderate platform participants</p>
                </div>
                <div className="relative w-full sm:w-[350px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Find by name or email..."
                        className="pl-11 h-12 rounded-2xl border-none bg-white shadow-sm focus-visible:ring-green-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-none shadow-sm bg-white rounded-[1.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-xl font-bold text-gray-800">
                        Platform Users ({filteredUsers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <Loader2 className="h-10 w-10 animate-spin text-green-600" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-gray-50 px-8">
                                    <TableHead className="pl-8 py-5 font-bold text-gray-400 uppercase text-[10px] tracking-widest">User Profile</TableHead>
                                    <TableHead className="py-5 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Platform Role</TableHead>
                                    <TableHead className="py-5 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Wallet Balance</TableHead>
                                    <TableHead className="py-5 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Account Status</TableHead>
                                    <TableHead className="py-5 font-bold text-gray-400 uppercase text-[10px] tracking-widest">Join Date</TableHead>
                                    <TableHead className="pr-8 py-5 text-right font-bold text-gray-400 uppercase text-[10px] tracking-widest">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id} className="border-gray-50 hover:bg-gray-50 transition-colors">
                                        <TableCell className="pl-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-base">{user.username}</span>
                                                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-tighter">REF: {user.reference_id}</span>
                                                <span className="text-xs text-gray-500 mt-1">{user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={user.role === 'client' ? 'default' : 'secondary'}
                                                className={`rounded-full px-4 py-1 text-[10px] font-bold uppercase ${user.role === 'client' ? 'bg-[#0b3d1d] text-white' : 'bg-gray-100 text-gray-600'}`}
                                            >
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-bold text-gray-900">
                                            ₦{user.balance.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={user.is_active ? 'outline' : 'destructive'}
                                                className={`rounded-full px-4 py-1 text-[10px] font-bold uppercase ${user.is_active ? 'border-green-500 text-green-700 bg-green-50' : ''}`}
                                            >
                                                {user.is_active ? 'Active' : 'Suspended'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            {new Date(user.date_joined).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="pr-8 text-right">
                                            <Link href={`/admin/users/${user.id}`}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-xl hover:bg-green-50 hover:text-green-700 font-bold text-xs group px-4 h-10"
                                                >
                                                    <Settings className="w-4 h-4 mr-2 transition-transform group-hover:rotate-45" />
                                                    Manage
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-20 text-gray-400">
                                            <Search className="w-8 h-8 mx-auto mb-4 opacity-20" />
                                            <p className="font-medium">No users found matching your search.</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
