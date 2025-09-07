"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useState } from "react"

export default function TestConvexPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  
  const testConnection = useQuery(api.test.testConnection)
  const allUsers = useQuery(api.test.getAllTestUsers)
  const createUser = useMutation(api.test.createTestUser)

  const handleCreateUser = async () => {
    if (!name || !email) return
    
    try {
      await createUser({ name, email })
      setName("")
      setEmail("")
    } catch (error) {
      console.error("Failed to create user:", error)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Convex Test Page</h1>
      
      <div className="space-y-6">
        {/* Test Connection */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
          {testConnection ? (
            <div className="text-green-600">
              ✅ {testConnection.message} (Timestamp: {testConnection.timestamp})
            </div>
          ) : (
            <div className="text-gray-500">Loading...</div>
          )}
        </div>

        {/* Create Test User */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create Test User</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter email"
              />
            </div>
            <button
              onClick={handleCreateUser}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Create User
            </button>
          </div>
        </div>

        {/* List All Users */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">All Users</h2>
          {allUsers ? (
            <div className="space-y-2">
              {allUsers.length === 0 ? (
                <p className="text-gray-500">No users found</p>
              ) : (
                allUsers.map((user) => (
                  <div key={user.id} className="border border-gray-200 rounded p-3">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-gray-500">
                      Role: {user.role} | Created: {new Date(user.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="text-gray-500">Loading users...</div>
          )}
        </div>
      </div>
    </div>
  )
}
