# CodeConnect Project Development Instructions

## 📋 Project Overview

**CodeConnect** is a Q&A platform for developers with the following architecture:
- **Backend**: Node.js + Express.js + Prisma ORM + PostgreSQL
- **Frontend**: React + Tailwind CSS + shadcn/ui (to be implemented)
- **Features**: User authentication, posts, comments, voting, categories, user profiles, admin panel

## 🏗️ Backend Architecture Understanding

### Core Components:
1. **Database Models** (Prisma Schema):
   - `User`: Authentication, profiles, karma points, roles
   - `Post`: Questions with categories, voting, best answers
   - `Comment`: Answers to posts with voting
   - `Vote`: Upvote/downvote system for posts and comments
   - `Category`: Post categorization

2. **API Structure**:
   - `/auth` - Authentication routes
   - `/api` - Post management
   - `/api/post` - Comment management
   - `/api/` - Voting system
   - `/admin/users` - User management
   - `/admin/categories` - Category management

3. **Controllers Organization**:
   - `auth/` - User authentication
   - `post/` - Posts, comments, voting
   - `profile/` - User profiles
   - `admin/` - Admin functionality

## 🎨 Frontend Development Guidelines

### Technology Stack:
- **Styling**: Tailwind CSS (primary)
- **Components**: shadcn/ui (when specified)
- **Framework**: React (to be implemented)
- **State Management**: React Context or Zustand
- **HTTP Client**: Axios or React Query

### Design System & Color Palette:

#### Primary Colors:
- **Primary Blue**: `#2563eb` (blue-600)
- **Secondary Blue**: `#1d4ed8` (blue-700)
- **Accent Blue**: `#3b82f6` (blue-500)

#### Neutral Colors:
- **Background**: `#ffffff` (white)
- **Secondary Background**: `#f8fafc` (slate-50)
- **Border**: `#e2e8f0` (slate-200)
- **Text Primary**: `#1e293b` (slate-800)
- **Text Secondary**: `#64748b` (slate-500)

#### Semantic Colors:
- **Success**: `#10b981` (emerald-500)
- **Warning**: `#f59e0b` (amber-500)
- **Error**: `#ef4444` (red-500)
- **Info**: `#3b82f6` (blue-500)

#### **Theme Color System:**
- **Primary Theme**: Blue-based color scheme
- **Accent Colors**: Use sparingly for highlights and CTAs
- **Background Hierarchy**: White → Light gray → Medium gray
- **Text Hierarchy**: Black → Dark gray → Medium gray → Light gray
- **Interactive Elements**: Blue for primary actions, gray for secondary
- **Status Colors**: Green for success, red for errors, yellow for warnings
- **Category Colors**: Use distinct colors for different categories but maintain readability

### UI/UX Standards:

#### Typography:
- **Headings**: Inter font family
- **Body**: Inter or system font
- **Code**: JetBrains Mono or Fira Code

#### Spacing System:
- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)

#### Component Guidelines:
1. **Cards**: Rounded corners (lg), subtle shadows
2. **Buttons**: Consistent padding, hover states
3. **Forms**: Clear labels, validation states
4. **Navigation**: Sticky header, clear hierarchy
5. **Responsive**: Mobile-first approach

#### **Text Color Guidelines:**
- **Category Text**: Always use black (`text-black` or `text-gray-900`) for category names and labels
- **Primary Text**: Use dark gray (`text-gray-800`) for main content
- **Secondary Text**: Use medium gray (`text-gray-600`) for descriptions
- **Muted Text**: Use light gray (`text-gray-500`) for subtle information
- **Never use transparent or green text** for categories or main content

#### **Mobile Responsiveness Requirements:**
- **Mobile-First Design**: Always start with mobile layout, then scale up
- **Breakpoints**: Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- **Touch-Friendly**: Minimum 44px touch targets for buttons and links
- **Readable Text**: Ensure text is readable on all screen sizes
- **Flexible Layouts**: Use flexbox and grid for responsive layouts
- **Image Scaling**: Ensure images scale properly on mobile
- **Navigation**: Collapsible navigation for mobile devices
- **Forms**: Stack form elements vertically on mobile
- **Cards**: Single column layout on mobile, multi-column on desktop

#### **Category Styling Guidelines:**
- **Text Color**: Always use `text-black` or `text-gray-900` for category names
- **Background**: Use light backgrounds (`bg-white`, `bg-gray-50`, `bg-blue-50`) for category cards
- **Icons**: Use colored icons but ensure text remains black for readability
- **Hover States**: Subtle background changes on hover, never change text color
- **Mobile Layout**: Single column on mobile, 2-3 columns on tablet, 4+ columns on desktop
- **Spacing**: Consistent padding and margins across all screen sizes
- **Typography**: Use consistent font weights and sizes for category labels

## 🔧 Development Workflow

### Step-by-Step Process:

1. **Analysis Phase**:
   - **Use Sequential Thinking**: Break down requirements systematically
   - Understand current backend structure
   - Identify API endpoints needed
   - Plan component hierarchy
   - Design data flow

2. **Implementation Phase**:
   - **Use Sequential Thinking**: Plan implementation steps carefully
   - Start with core components
   - Implement authentication flow
   - Build main features incrementally
   - Test each feature thoroughly

3. **Refinement Phase**:
   - **Use Sequential Thinking**: Analyze optimization opportunities
   - Optimize performance
   - Improve accessibility
   - Add animations/transitions
   - Cross-browser testing

### Sequential Thinking Integration:

#### **Automatic Usage Scenarios:**
- **Complex Feature Implementation**: When building multi-step features
- **Debugging Issues**: When troubleshooting complex problems
- **Architecture Decisions**: When making structural changes
- **Performance Optimization**: When analyzing and improving performance
- **Security Implementation**: When adding authentication/authorization
- **Database Operations**: When modifying schema or queries
- **API Design**: When creating new endpoints or modifying existing ones
- **Component Architecture**: When designing complex UI components

#### **Sequential Thinking Workflow:**
1. **Problem Identification**: Clearly define what needs to be solved
2. **Analysis**: Break down into manageable components
3. **Solution Design**: Plan the approach step-by-step
4. **Implementation**: Execute with careful monitoring
5. **Verification**: Test and validate each step
6. **Documentation**: Record decisions and reasoning

#### **Browser MCP Integration:**
- **During Development**: Use browser MCP to monitor UI changes in real-time
- **Error Detection**: Check console logs and network errors automatically
- **Visual Verification**: Take screenshots to verify design implementation
- **Responsive Testing**: Use browser tools to test mobile responsiveness
- **Accessibility Checks**: Run audits to ensure compliance
- **Performance Monitoring**: Check for optimization opportunities

### Error Prevention Guidelines:

1. **Always verify**:
   - API endpoint responses
   - Data types and structures
   - Component prop requirements
   - State management consistency

2. **Test thoroughly**:
   - User interactions
   - Edge cases
   - Responsive behavior
   - Loading states

3. **Document decisions**:
   - Component architecture choices
   - State management patterns
   - API integration methods

### **Mandatory Design Requirements:**

#### **Text Color Compliance:**
- ✅ **Always use black text** (`text-black` or `text-gray-900`) for categories and labels
- ❌ **Never use transparent or green text** for main content
- ✅ **Ensure proper contrast** for accessibility
- ✅ **Test readability** on all screen sizes

#### **Mobile Responsiveness Compliance:**
- ✅ **Mobile-first approach** for all components
- ✅ **Responsive breakpoints** (`sm:`, `md:`, `lg:`, `xl:`)
- ✅ **Touch-friendly targets** (minimum 44px)
- ✅ **Single column layout** on mobile for cards and lists
- ✅ **Collapsible navigation** for mobile devices
- ✅ **Stacked form elements** on mobile
- ✅ **Scalable images** and icons

#### **Theme Color Compliance:**
- ✅ **Blue-based primary theme** for consistency
- ✅ **Proper text hierarchy** (black → dark gray → medium gray)
- ✅ **Semantic color usage** (green=success, red=error, yellow=warning)
- ✅ **Accessible color combinations** for all text and backgrounds

#### **Browser MCP Compliance:**
- ✅ **Use browser MCP** for all UI development and debugging
- ✅ **Take screenshots** to verify visual implementation
- ✅ **Check console errors** during development
- ✅ **Monitor network requests** for API issues
- ✅ **Run accessibility audits** for compliance
- ✅ **Test responsive design** on different screen sizes
- ✅ **Verify performance** with browser tools

### Documentation & Research Protocol:

1. **For Any Technology/Library**:
   - **Primary Source**: Use Context7 for up-to-date documentation
   - **Verification**: Cross-reference with official docs
   - **Best Practices**: Check for current recommendations

2. **For shadcn/ui Components**:
   - **Primary Source**: Use shadcn MCP server for component guidance
   - **Documentation**: Verify with Context7 for latest shadcn/ui docs
   - **Customization**: Follow design system guidelines

3. **Implementation Process**:
   - Research → Context7 for documentation
   - Plan → Design system integration
   - Implement → Follow best practices
   - Test → Verify functionality

### Browser MCP Usage Protocol:

#### **Automatic Browser MCP Usage:**
- **When to Use**: Always use browser MCP for UI development, debugging, and error checking
- **Purpose**: Real-time UI inspection, error detection, and visual verification
- **Automatic Trigger**: Use browser MCP when:
  - Implementing new UI components
  - Debugging layout issues
  - Checking responsive design
  - Verifying color schemes and text readability
  - Testing user interactions
  - Validating accessibility
  - Checking for console errors
  - Monitoring network requests
  - Testing form submissions
  - Verifying mobile responsiveness

#### **Browser MCP Workflow:**
1. **Development Phase**:
   - Take screenshots during development
   - Check console logs for errors
   - Monitor network requests
   - Verify responsive behavior

2. **Debugging Phase**:
   - Use browser tools to inspect elements
   - Check for JavaScript errors
   - Validate CSS styling
   - Test user interactions

3. **Testing Phase**:
   - Run accessibility audits
   - Check performance metrics
   - Verify cross-browser compatibility
   - Test mobile responsiveness

#### **Browser MCP Commands to Use:**
- **Screenshots**: `takeScreenshot()` for visual verification
- **Console Logs**: `getConsoleLogs()` and `getConsoleErrors()` for debugging
- **Network Monitoring**: `getNetworkLogs()` and `getNetworkErrors()` for API issues
- **Accessibility**: `runAccessibilityAudit()` for compliance
- **Performance**: `runPerformanceAudit()` for optimization
- **SEO**: `runSEOAudit()` for search optimization
- **Best Practices**: `runBestPracticesAudit()` for quality assurance

### Sequential Thinking Protocol:

#### **Automatic Sequential Thinking Usage:**
- **When to Use**: For complex problem-solving, architecture decisions, debugging, and multi-step implementations
- **Purpose**: Break down complex tasks into logical steps, analyze problems systematically, and ensure thorough understanding
- **Automatic Trigger**: Use sequential thinking when:
  - Analyzing complex requirements
  - Debugging issues
  - Planning architecture changes
  - Implementing new features
  - Optimizing performance
  - Making design decisions

#### **Sequential Thinking Process:**
1. **Problem Analysis**:
   - Break down the problem into components
   - Identify dependencies and relationships
   - Map out the solution space

2. **Solution Planning**:
   - Generate multiple approaches
   - Evaluate trade-offs
   - Select optimal solution

3. **Implementation Strategy**:
   - Plan step-by-step execution
   - Identify potential issues
   - Prepare fallback options

4. **Verification & Testing**:
   - Validate each step
   - Test assumptions
   - Ensure quality standards

#### **Sequential Thinking Guidelines:**
- **Always start with analysis** before implementation
- **Document each step** for clarity and debugging
- **Question assumptions** at each stage
- **Consider alternatives** before committing to solutions
- **Verify understanding** before proceeding
- **Plan for edge cases** and error scenarios

#### **Complex Problem Examples Requiring Sequential Thinking:**
- Database schema modifications
- API endpoint design and implementation
- Component architecture decisions
- State management strategies
- Performance optimization
- Security implementation
- Error handling patterns
- Testing strategy development

## 🎯 Feature Implementation Priority

### Phase 1: Core Foundation
1. **Authentication System**
   - Login/Register forms
   - JWT token management
   - Protected routes

2. **Basic Layout**
   - Header with navigation
   - Main content area
   - Footer

3. **Post Listing**
   - Display posts with categories
   - Basic filtering
   - Pagination

### Phase 2: Core Features
1. **Post Management**
   - Create/edit posts
   - Rich text editor
   - Image upload

2. **Comment System**
   - Add/edit comments
   - Nested replies
   - Best answer selection

3. **Voting System**
   - Upvote/downvote posts/comments
   - Vote count display

### Phase 3: Advanced Features
1. **User Profiles**
   - Profile pages
   - Karma points
   - User activity

2. **Admin Panel**
   - User management
   - Category management
   - Content moderation

3. **Search & Filtering**
   - Advanced search
   - Category filtering
   - Tag system

## 🚨 Communication Protocol

### When Confusion Arises:

1. **Ask for clarification** on:
   - Specific feature requirements
   - Design preferences
   - Technical implementation details
   - Priority of features

2. **Provide options** when:
   - Multiple approaches exist
   - Design decisions need input
   - Technical trade-offs arise

3. **Document decisions** for:
   - Architecture choices
   - Component structure
   - State management patterns

### Documentation Guidelines:

#### **Always Use Context7 for Documentation:**
- **When to use**: For any library, framework, or technology documentation
- **Purpose**: Get up-to-date, accurate documentation
- **Process**: 
  1. Use Context7 to fetch latest documentation
  2. Verify current best practices
  3. Implement based on official docs
  4. Cross-reference with multiple sources if needed

#### **shadcn/ui Implementation Protocol:**
- **When requested**: Use shadcn MCP server for component guidance
- **Process**:
  1. Check shadcn MCP server for component recommendations
  2. Get proper implementation code
  3. Customize according to design system
  4. Verify with Context7 for latest shadcn/ui docs

### Clarification Questions Format:
```
❓ Clarification Needed:
- What specific aspect needs clarification?
- What are the current options?
- What is the preferred approach?
- Any specific constraints or requirements?
```

### Mantine Removal Decision Format:
```
🔍 Mantine Component Analysis:
- Component: [Component Name]
- Usage: [Single/Multiple pages]
- Dependencies: [List of dependencies]
- Risk Level: [Low/Medium/High]
- Recommendation: [Remove/Keep/Skip]
- Alternative: [Tailwind/shadcn/ui/Custom]
- Reason: [Detailed explanation]
```

### Documentation Request Format:
```
📚 Documentation Needed:
- Library/Framework: [Name]
- Topic: [Specific aspect]
- Context: [What you're trying to achieve]
- Priority: [High/Medium/Low]
```

### shadcn/ui Request Format:
```
🎨 shadcn/ui Component Needed:
- Component Type: [Button/Card/Form/etc.]
- Use Case: [What you're building]
- Design Requirements: [Styling needs]
- Integration: [How it fits in the project]
```

### Sequential Thinking Decision Format:
```
🧠 Sequential Thinking Analysis:
- Problem: [What needs to be solved]
- Complexity Level: [Low/Medium/High]
- Steps Required: [Estimated number of steps]
- Dependencies: [What this depends on]
- Expected Outcome: [What should be achieved]
- Risk Assessment: [Potential issues to consider]
```

### Browser MCP Request Format:
```
🌐 Browser MCP Analysis:
- Task: [UI development/debugging/testing]
- Component: [What component to check]
- Issue: [Specific problem or verification needed]
- Screenshot: [Yes/No for visual verification]
- Console Check: [Yes/No for error checking]
- Network Check: [Yes/No for API monitoring]
- Audit Type: [Accessibility/Performance/SEO/Best Practices]
```

## 📝 Code Quality Standards

### Backend:
- Use async/await for database operations
- Implement proper error handling
- Validate input data
- Use meaningful variable names
- Add JSDoc comments for complex functions

### Frontend:
- Use TypeScript when possible
- Implement proper loading states
- Handle error boundaries
- Use semantic HTML
- Ensure accessibility compliance

### General:
- Follow consistent naming conventions
- Use meaningful commit messages
- Implement proper logging
- Write clean, readable code
- Add comments for complex logic

## 🎨 shadcn/ui Integration

### When to Use shadcn/ui:
- When explicitly requested
- For complex form components
- For advanced UI patterns
- When Tailwind alone is insufficient

### shadcn/ui Guidelines:
- Customize theme to match design system
- Maintain consistency with custom components
- Use shadcn/ui as enhancement, not replacement
- Ensure proper TypeScript integration

## ⚠️ Mantine UI Library Management

### Mantine Removal Guidelines:

#### **Before Removing Mantine:**
1. **Analyze Dependencies**:
   - Check which components use Mantine
   - Identify shared components across multiple pages
   - Map out component relationships and dependencies

2. **Risk Assessment**:
   - If multiple pages use the same Mantine component → **SKIP REMOVAL**
   - If single page usage → Safe to remove and replace
   - If complex form components → Consider alternatives carefully

#### **Safe Removal Scenarios:**
- ✅ Single page components
- ✅ Simple UI elements (buttons, cards, inputs)
- ✅ Non-critical components
- ✅ Components with clear Tailwind alternatives

#### **Skip Removal Scenarios:**
- ❌ Components used across multiple pages
- ❌ Complex form components with validation
- ❌ Advanced UI patterns (modals, dropdowns, date pickers)
- ❌ Components with complex state management
- ❌ When removal would cause cascading errors

#### **Alternative Approaches:**

1. **Tailwind CSS Alternatives**:
   ```jsx
   // Instead of Mantine Button
   <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
     Click me
   </button>
   
   // Instead of Mantine Card
   <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
     Card content
   </div>
   ```

2. **shadcn/ui Components**:
   ```jsx
   // For complex form components
   import { Button } from "@/components/ui/button"
   import { Card, CardContent, CardHeader } from "@/components/ui/card"
   ```

3. **Custom Components**:
   ```jsx
   // Create reusable components with Tailwind
   const CustomButton = ({ children, variant = "primary", ...props }) => {
     const variants = {
       primary: "bg-blue-600 hover:bg-blue-700 text-white",
       secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
       danger: "bg-red-600 hover:bg-red-700 text-white"
     }
     
     return (
       <button 
         className={`px-4 py-2 rounded-md font-medium transition-colors ${variants[variant]}`}
         {...props}
       >
         {children}
       </button>
     )
   }
   ```

#### **Removal Process:**
1. **Step 1**: Identify component usage across the project
2. **Step 2**: Check for shared dependencies
3. **Step 3**: If safe → Create Tailwind alternative
4. **Step 4**: If risky → Keep Mantine, document reason
5. **Step 5**: Test thoroughly after any changes

#### **Documentation Requirements:**
- Document why Mantine was kept in specific cases
- List alternative components created
- Note any performance improvements
- Track bundle size changes

## 🔄 Development Commands

### Backend:
```bash
npm run server    # Start development server
npm run generate  # Generate Prisma client
npm run clean     # Clean database
```

### Frontend (when implemented):
```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Run linter
npm run test      # Run tests
```

---

## 📋 Quick Reference

### Color Classes (Tailwind):
- **Category Text**: `text-black` or `text-gray-900` (MANDATORY)
- **Primary Text**: `text-gray-800`
- **Secondary Text**: `text-gray-600`
- **Muted Text**: `text-gray-500`
- **Primary**: `bg-blue-600`, `text-blue-600`
- **Secondary**: `bg-slate-100`, `text-slate-600`
- **Success**: `bg-emerald-500`, `text-emerald-500`
- **Warning**: `bg-amber-500`, `text-amber-500`
- **Error**: `bg-red-500`, `text-red-500`

### Responsive Classes:
- **Mobile**: `block md:hidden` (mobile only)
- **Desktop**: `hidden md:block` (desktop only)
- **Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- **Flex**: `flex-col md:flex-row`
- **Spacing**: `p-4 md:p-6 lg:p-8`

### Common Patterns:
- Cards: `bg-white rounded-lg shadow-md p-6`
- Buttons: `px-4 py-2 rounded-md font-medium transition-colors`
- Forms: `space-y-4`
- Layout: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

### API Endpoints:
- Auth: `/auth/login`, `/auth/register`
- Posts: `/api/posts`, `/api/posts/:id`
- Comments: `/api/post/:postId/comments`
- Votes: `/api/votes`
- Profile: `/api/profile`
- Admin: `/admin/users`, `/admin/categories`

---

**Remember**: Always prioritize user experience, maintain code quality, and communicate clearly when clarification is needed. This instruction file should be updated as the project evolves. 