import { useEffect, useMemo, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const initialForm = {
  name: '',
  email: '',
  password: '',
  title: '',
  content: '',
  tags: '',
};

function App() {
  const [view, setView] = useState('home');
  const [authMode, setAuthMode] = useState('login');
  const [token, setToken] = useState(localStorage.getItem('blogToken') || '');
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('blogUser') || 'null')
  );
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState('');
  const [tagsFilter, setTagsFilter] = useState('');

  const filteredPosts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const tagList = tagsFilter
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    return posts.filter((post) => {
      const textMatch =
        !searchTerm ||
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm);

      const tagMatch =
        tagList.length === 0 ||
        tagList.every((tag) =>
          post.tags?.some((item) => item.toLowerCase() === tag)
        );

      return textMatch && tagMatch;
    });
  }, [posts, search, tagsFilter]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('blogToken', token);
    } else {
      localStorage.removeItem('blogToken');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('blogUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('blogUser');
    }
  }, [user]);

  useEffect(() => {
    const loadPosts = async () => {
      if (!token) {
        setPosts([]);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPosts(data || []);
        }
      } catch (error) {
        console.error('Failed to load posts', error);
      }
    };

    loadPosts();
  }, [token]);

  useEffect(() => {
    const loadMyPosts = async () => {
      if (!token) {
        setMyPosts([]);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/users/me/posts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMyPosts(data || []);
        }
      } catch (error) {
        console.error('Failed to load user posts', error);
      }
    };

    loadMyPosts();
  }, [token]);

  const fetchUserProfile = async (currentToken) => {
    const response = await fetch(`${API_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${currentToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Unable to fetch profile');
    }

    return response.json();
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      email: form.email,
      password: form.password,
      ...(authMode === 'signup'
        ? {
            name: form.name,
            avatar: 'https://picsum.photos/seed/picsum/200/300',
          }
        : {}),
    };

    const endpoint =
      authMode === 'signup' ? '/api/auth/register' : '/api/auth/login';

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      const nextToken = data.token;
      const nextUser = data.user || {
        name: payload.name || data.user?.name || '',
        email: payload.email,
      };
      setToken(nextToken);
      setUser(nextUser);
      setForm(initialForm);
      setView('home');
    } catch (error) {
      alert(error.message || 'Authentication failed');
    }
  };

  const handleGoogleAuth = async () => {
    const googleUser = {
      name: form.name || 'Google User',
      email: form.email || `google-user-${Date.now()}@gmail.com`,
      avatar: 'https://picsum.photos/seed/picsum/200/300',
    };

    try {
      const response = await fetch(`${API_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleUser),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Google login failed');
      }

      setToken(data.token);
      setUser(data.user);
      setForm(initialForm);
      setView('home');
    } catch (error) {
      alert(error.message || 'Google login failed');
    }
  };

  const handleCreatePost = async (event) => {
    event.preventDefault();
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          tags: form.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          image: 'https://picsum.photos/seed/picsum/200/300',
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create post');
      }

      setForm({ ...initialForm, title: '', content: '', tags: '' });
      setView('dashboard');

      const profile = await fetchUserProfile(token);
      const meResponse = await fetch(`${API_URL}/api/users/me/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meResponse.ok) {
        setMyPosts(await meResponse.json());
      }
      setUser((currentUser) => ({ ...currentUser, ...profile }));
    } catch (error) {
      alert(error.message || 'Could not create post');
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setView('home');
    setForm(initialForm);
  };

  const renderAuthCard = () => (
    <div className="card auth-card">
      <h2>{authMode === 'signup' ? 'Signup' : 'Login'}</h2>
      <form onSubmit={handleAuthSubmit}>
        {authMode === 'signup' && (
          <div>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
        )}

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button type="submit">
          {authMode === 'signup' ? 'Create Account' : 'Login'}
        </button>
      </form>

      <div className="social-row">
        <button
          type="button"
          className="secondary-button"
          onClick={handleGoogleAuth}
        >
          {authMode === 'signup' ? 'Sign Up with Google' : 'Login with Google'}
        </button>
      </div>
    </div>
  );

  const renderHome = () => (
    <div>
      <section className="hero">
        <h1>Explore Posts</h1>
      </section>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by tags (comma-separated)"
          value={tagsFilter}
          onChange={(e) => setTagsFilter(e.target.value)}
        />
      </div>

      <div className="post-grid">
        {filteredPosts.length === 0 ? (
          <div className="card empty-state">No posts found yet.</div>
        ) : (
          filteredPosts.map((post) => (
            <article className="card post-card" key={post._id || post.title}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <div className="tags-row">
                {post.tags?.map((tag) => (
                  <span key={`${post._id}-${tag}`} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="card profile-card">
      <h2>My Profile</h2>
      <p>{user?.email}</p>
      <p>{user?.name}</p>
      <p>Total Posts: {myPosts.length}</p>
    </div>
  );

  const renderDashboard = () => (
    <div>
      <div className="dashboard-header">
        <h2>My Posts</h2>
        <button
          type="button"
          className="primary-button"
          onClick={() => setView('create-post')}
        >
          + Create Post
        </button>
      </div>

      {myPosts.length === 0 ? (
        <div className="card empty-state">No posts yet.</div>
      ) : (
        <div className="post-list">
          {myPosts.map((post) => (
            <div className="card post-card" key={post._id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <div className="action-row">
                <button type="button">View</button>
                <button type="button">Edit</button>
                <button type="button">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreatePost = () => (
    <div className="card">
      <h2>Create Post</h2>
      <form onSubmit={handleCreatePost}>
        <div>
          <label htmlFor="post-title">Title</label>
          <input
            id="post-title"
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="post-content">Content</label>
          <textarea
            id="post-content"
            name="content"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="post-tags">Tags</label>
          <input
            id="post-tags"
            name="tags"
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );

  const renderMainContent = () => {
    if (!token) {
      return authMode === 'login' || authMode === 'signup'
        ? renderAuthCard()
        : renderHome();
    }

    if (view === 'profile') return renderProfile();
    if (view === 'dashboard') return renderDashboard();
    if (view === 'create-post') return renderCreatePost();
    return renderHome();
  };

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="brand">Blog App</div>

        <div className="nav-links">
          <button type="button" onClick={() => setView('home')}>
            Home
          </button>
          {!token && (
            <>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setView('home');
                }}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setView('home');
                }}
              >
                Signup
              </button>
            </>
          )}

          {token && (
            <>
              <button type="button" onClick={() => setView('profile')}>
                Profile
              </button>
              <button type="button" onClick={() => setView('dashboard')}>
                Dashboard
              </button>
              <button type="button" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="container">{renderMainContent()}</main>
    </div>
  );
}

export default App;
