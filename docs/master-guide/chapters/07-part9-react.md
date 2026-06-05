<div class="part-divider">
<div class="part-label">Part IX</div>
<div class="part-title">React</div>
<div class="part-desc">React is the view layer of SkillSync. This part covers everything from the component model and JSX to every hook, reconciliation internals, routing, forms, error boundaries, and testing. By the end, you'll understand not just how to use React, but how it actually works.</div>
</div>

# 64–74. React Comprehensive

<span class="chapter-label">Chapters 64–74</span>

## 64.1 The React Mental Model

> "UI is a function of state: `UI = f(state)`"

When state changes, React re-renders the component tree, compares (diffs) with the previous version, and updates only the changed DOM nodes.

## 64.2 JSX

JSX is syntactic sugar for `React.createElement`:

```jsx
// JSX
const element = <h1 className="title">Hello</h1>;

// Compiles to:
const element = React.createElement('h1', { className: 'title' }, 'Hello');
```

**Rules:**
- Return one root element (or use `<>...</>` fragment)
- Use `className` not `class`
- Use `htmlFor` not `for`
- JavaScript expressions in `{}`
- `style` takes an object: `style={{ color: 'red' }}`

## 65.1 Components

```jsx
// Function Component (modern)
function Welcome({ name, age = 18 }) {
    return <h1>Hello, {name} ({age})</h1>;
}

// Arrow function
const Welcome = ({ name }) => <h1>Hello, {name}</h1>;

// Class Component (legacy, rare now)
class Welcome extends React.Component {
    render() {
        return <h1>Hello, {this.props.name}</h1>;
    }
}
```

## 65.2 Props vs State

| | Props | State |
|---|---|---|
| Passed by | Parent | Component itself |
| Mutable | ❌ Read-only | ✅ Mutable via setter |
| Triggers re-render | Yes (when changed) | Yes (when changed) |
| Use for | Configuration | Data that changes |

## 66.1 useState

```jsx
const [count, setCount] = useState(0);
const [user, setUser] = useState({ name: '', email: '' });

// Functional update (safer for async)
setCount(c => c + 1);

// Object update (spread required)
setUser(u => ({ ...u, name: 'Renu' }));
```

**Rules:**
- Never mutate state directly
- State updates are batched and asynchronous
- Functional form sees latest state

## 66.2 useEffect

```jsx
useEffect(() => {
    // Runs after render
    const subscription = subscribe();
    
    // Cleanup function
    return () => {
        subscription.unsubscribe();
    };
}, [dependency1, dependency2]);  // Re-run when these change
```

**Dependency patterns:**

| Deps | Runs when |
|---|---|
| Omitted | After every render |
| `[]` | Once on mount |
| `[a, b]` | On mount and when a or b changes |

**Common useEffect patterns:**

```jsx
// Data fetching
useEffect(() => {
    let cancelled = false;
    fetchUser(id).then(user => {
        if (!cancelled) setUser(user);
    });
    return () => { cancelled = true; };
}, [id]);

// Event listeners
useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
}, []);
```

## 67.1 All Built-in Hooks

| Hook | Purpose |
|---|---|
| `useState` | Persistent state |
| `useEffect` | Side effects |
| `useContext` | Consume context |
| `useReducer` | Complex state logic |
| `useCallback` | Memoized function |
| `useMemo` | Memoized value |
| `useRef` | Mutable reference (DOM or value) |
| `useImperativeHandle` | Expose imperative API |
| `useLayoutEffect` | Sync layout effect |
| `useDebugValue` | Debug label for custom hooks |
| `useId` | Stable unique ID (React 18) |
| `useDeferredValue` | Defer re-render (React 18) |
| `useTransition` | Mark update as non-urgent (React 18) |
| `useSyncExternalStore` | Subscribe to external store |

## 67.2 useReducer

For complex state with multiple sub-values or interdependent updates:

```jsx
const initialState = { count: 0, step: 1 };

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return { ...state, count: state.count + state.step };
        case 'decrement':
            return { ...state, count: state.count - state.step };
        case 'setStep':
            return { ...state, step: action.payload };
        default:
            throw new Error();
    }
}

function Counter() {
    const [state, dispatch] = useReducer(reducer, initialState);
    
    return (
        <>
            <p>{state.count}</p>
            <button onClick={() => dispatch({ type: 'increment' })}>+</button>
            <button onClick={() => dispatch({ type: 'setStep', payload: 5 })}>
                Step: 5
            </button>
        </>
    );
}
```

## 67.3 useRef

```jsx
// DOM reference
const inputRef = useRef(null);
<input ref={inputRef} />;
inputRef.current.focus();

// Mutable value that doesn't trigger re-render
const renderCount = useRef(0);
useEffect(() => { renderCount.current++; });
```

## 67.4 useMemo vs useCallback

```jsx
// Memoize expensive calculation
const sortedUsers = useMemo(() => {
    return users.sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

// Memoize function reference
const handleSubmit = useCallback((data) => {
    submitForm(data);
}, []);  // Dependencies

// Equivalent: useCallback(fn, deps) === useMemo(() => fn, deps)
```

> Don't over-memoize! The cost of comparison can exceed the cost of re-creating.

## 68.1 Custom Hooks

Extract reusable stateful logic:

```jsx
function useLocalStorage(key, initialValue) {
    const [stored, setStored] = useState(() => {
        try {
            return JSON.parse(window.localStorage.getItem(key)) || initialValue;
        } catch {
            return initialValue;
        }
    });
    
    const setValue = (value) => {
        setStored(value);
        window.localStorage.setItem(key, JSON.stringify(value));
    };
    
    return [stored, setValue];
}

// Usage
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

**SkillSync custom hooks:** `useAuth`, `useToast`, `useApi`

## 69.1 Forms & Controlled Inputs

```jsx
function LoginForm() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    
    const handleChange = (e) => {
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email.includes('@')) {
            setErrors({ email: 'Invalid email' });
            return;
        }
        await login(form);
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
            />
            {errors.email && <span>{errors.email}</span>}
            <button type="submit">Login</button>
        </form>
    );
}
```

## 69.2 React Hook Form (library)

```jsx
import { useForm } from 'react-hook-form';

function LoginForm() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    
    const onSubmit = async (data) => {
        await login(data);
    };
    
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('email', { required: 'Email required' })} />
            {errors.email && <span>{errors.email.message}</span>}
            
            <input {...register('password', { minLength: 8 })} />
            <button type="submit">Login</button>
        </form>
    );
}
```

## 70.1 React Router

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { path: '', element: <Home /> },
            { path: 'dashboard', element: <Dashboard />, 
              loader: dashboardLoader },
            { path: 'mentors/:id', element: <MentorProfile /> },
            { path: '*', element: <NotFound /> }
        ]
    }
]);

function App() {
    return <RouterProvider router={router} />;
}
```

**Router hooks:**

```jsx
const { id } = useParams();           // URL params
const navigate = useNavigate();       // Programmatic navigation
const location = useLocation();       // Current URL info
const match = useMatch('/users/:id'); // Pattern matching
```

## 71.1 Context API

```jsx
// Create context
const AuthContext = createContext(null);

// Provider
function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    
    const login = async (credentials) => { /* ... */ };
    const logout = () => { /* ... */ };
    
    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Consumer hook
function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be in AuthProvider');
    return context;
}

// Usage
function UserMenu() {
    const { user, logout } = useAuth();
    return <button onClick={logout}>Logout {user.name}</button>;
}
```

## 72.1 Error Boundaries

Catch errors in child components:

```jsx
class ErrorBoundary extends React.Component {
    state = { hasError: false };
    
    static getDerivedStateFromError(error) {
        return { hasError: true };
    }
    
    componentDidCatch(error, errorInfo) {
        logErrorToService(error, errorInfo);
    }
    
    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong.</h1>;
        }
        return this.props.children;
    }
}

// Usage
<ErrorBoundary>
    <BuggyComponent />
</ErrorBoundary>
```

> Error boundaries must be class components. They catch errors during rendering, in lifecycle methods, and in constructors of the whole tree below them.

## 72.2 Suspense & Lazy Loading

```jsx
import { lazy, Suspense } from 'react';

const AdminPanel = lazy(() => import('./AdminPanel'));

function App() {
    return (
        <Suspense fallback={<Spinner />}>
            <AdminPanel />
        </Suspense>
    );
}
```

## 72.3 Portals

Render children outside parent DOM hierarchy:

```jsx
import { createPortal } from 'react-dom';

function Modal({ children, onClose }) {
    return createPortal(
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal">{children}</div>
        </div>,
        document.body  // Render here instead of parent
    );
}
```

Use for: modals, tooltips, toasts (avoid z-index wars).

## 73.1 Reconciliation & Keys

React's diffing algorithm:
1. Different element types → destroy and recreate tree
2. Same type, different attributes → update attributes
3. Same type, children → compare lists

**Keys are crucial:**

```jsx
// ❌ Bad: index as key
{items.map((item, index) => <li key={index}>{item.name}</li>)}

// ✅ Good: stable unique ID
{items.map(item => <li key={item.id}>{item.name}</li>)}
```

Using index as key causes bugs when items reorder or are deleted — React reuses wrong components.

## 73.2 Performance Optimization

| Technique | When to use |
|---|---|
| `React.memo` | Component re-renders too often with same props |
| `useMemo` | Expensive calculation, result used in render |
| `useCallback` | Function passed to `React.memo` child |
| `useTransition` | Mark update as non-urgent (keep UI responsive) |
| `useDeferredValue` | Defer re-render of expensive child |
| Virtualization (`react-window`) | Long lists (1000+ items) |
| Code splitting (`React.lazy`) | Large components not always needed |

```jsx
const ExpensiveList = React.memo(function ExpensiveList({ items }) {
    return <ul>{items.map(renderItem)}</ul>;
});
```

## 74.1 Testing React

**React Testing Library** philosophy: test like a user, not implementation.

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('increments counter on click', async () => {
    render(<Counter />);
    
    const button = screen.getByRole('button', { name: /increment/i });
    await userEvent.click(button);
    
    expect(screen.getByText('1')).toBeInTheDocument();
});
```

**Query priority:**
1. `getByRole` (accessible, preferred)
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` (last resort)

**Mocking API:**
```jsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
    rest.get('/api/user', (req, res, ctx) => {
        return res(ctx.json({ name: 'Test User' }));
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```
