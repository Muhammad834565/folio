import { render, screen, fireEvent } from '@testing-library/react'
import { ShareModal } from '../ShareModal'

describe('ShareModal', () => {
  const mockUsers = [
    { id: '1', name: 'Owner', email: 'owner@example.com' },
    { id: '2', name: 'Collaborator', email: 'collab@example.com' },
  ]

  it('renders nothing when not open', () => {
    const { container } = render(
      <ShareModal 
        isOpen={false} 
        onClose={() => {}} 
        documentId="doc1" 
        currentUserId="1" 
        users={mockUsers} 
      />
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('renders modal content when open', () => {
    render(
      <ShareModal 
        isOpen={true} 
        onClose={() => {}} 
        documentId="doc1" 
        currentUserId="1" 
        users={mockUsers} 
      />
    )
    expect(screen.getByText('Share Document')).toBeInTheDocument()
    expect(screen.getByText('Collaborator (collab@example.com)')).toBeInTheDocument()
    // Owner shouldn't be in the select list
    expect(screen.queryByText('Owner (owner@example.com)')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = jest.fn()
    render(
      <ShareModal 
        isOpen={true} 
        onClose={onCloseMock} 
        documentId="doc1" 
        currentUserId="1" 
        users={mockUsers} 
      />
    )
    
    // Close button is rendered with X icon. 
    // We can find it by its generic role or class, here we rely on the button elements.
    const buttons = screen.getAllByRole('button')
    // First button should be the X icon
    fireEvent.click(buttons[0])
    expect(onCloseMock).toHaveBeenCalled()
  })
})
