import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { FolderKanban, PlusCircle, Trash2, Edit2, X } from 'lucide-react';

interface Project {
  _id: string;
  projectName: string;
  description: string;
  createdDate: string;
  admin: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

const ManageProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState({ projectName: '', description: '' });
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/admin/projects');
      setProjects(res.data);
    } catch {
      console.error('Failed to fetch projects');
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      if (editingId) {
        await axios.put(`/admin/projects/${editingId}`, formData);
        setMessage('Project updated successfully!');
      } else {
        await axios.post('/admin/projects', formData);
        setMessage('Project created successfully!');
      }
      setFormData({ projectName: '', description: '' });
      setEditingId(null);
      fetchProjects();
    } catch {
      setMessage(`Failed to ${editingId ? 'update' : 'create'} project.`);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingId(project._id);
    setFormData({ projectName: project.projectName, description: project.description || '' });
    setMessage('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ projectName: '', description: '' });
    setMessage('');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await axios.delete(`/admin/projects/${id}`);
      fetchProjects();
    } catch {
      alert('Failed to delete project.');
    }
  };

  return (
    <main className="max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
      
      {/* Left Column: Add/Edit Project Form */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {editingId ? <Edit2 className="h-5 w-5 text-blue-600" /> : <PlusCircle className="h-5 w-5 text-gray-700" />}
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? 'Edit Project' : 'Add New Project'}
              </h2>
            </div>
            {editingId && (
              <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {message && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input
                required
                type="text"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                value={formData.projectName}
                onChange={(e) => setFormData({...formData, projectName: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <button
              type="submit"
              className={`w-full text-white p-3 rounded-lg font-medium transition-colors mt-2 ${
                editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-black hover:bg-gray-800'
              }`}
            >
              {editingId ? 'Update Project' : 'Create Project'}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Project List */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Projects & Categories</h2>
            </div>
            <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
              {projects.length} Total
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Project Name</th>
                  <th className="px-6 py-4 font-medium hidden sm:table-cell">Description</th>
                  <th className="px-6 py-4 font-medium">Created On</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {projects.map((proj) => (
                  <tr key={proj._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {proj.projectName}
                    </td>
                    <td className="px-6 py-4 text-gray-500 hidden sm:table-cell">
                      <div className="max-w-[200px] truncate" title={proj.description}>
                        {proj.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(proj.createdDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button 
                        onClick={() => handleEdit(proj)}
                        className="text-blue-600 hover:text-blue-800 p-1 mr-2 transition-colors"
                        title="Edit Project"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(proj._id)}
                        className="text-red-600 hover:text-red-800 p-1 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No projects found. Add one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ManageProjects;
