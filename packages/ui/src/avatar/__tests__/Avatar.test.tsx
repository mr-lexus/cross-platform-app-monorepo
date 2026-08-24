import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Avatar } from '../Avatar';

afterEach(cleanup);

vi.mock('react-native-web', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-native-web')>();
  function MockImage(props: {
    source?: { uri?: string };
    onError?: (e: unknown) => void;
    style?: React.CSSProperties;
  }) {
    return (
      <img
        alt=""
        draggable={false}
        src={props.source?.uri}
        onError={props.onError}
        style={props.style}
      />
    );
  }
  return { ...actual, Image: MockImage };
});

describe('Avatar', () => {
  it('renders an <img> with the source uri when source is provided and valid', () => {
    const { container } = render(
      <Avatar
        name="Alice Johnson"
        source={{ uri: 'https://example.com/avatar.png' }}
      />,
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img!.getAttribute('src')).toBe('https://example.com/avatar.png');
  });

  it('renders initials text and a 48px container when no source is provided', () => {
    const { container } = render(<Avatar name="Alice Johnson" />);
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('AJ')).toBeInTheDocument();
    const root = screen.getByLabelText('Alice Johnson');
    expect(root.style.width).toBe('48px');
    expect(root.style.height).toBe('48px');
  });

  it('falls back to initials on image error without changing container dimensions (zero layout shift)', () => {
    const { container } = render(
      <Avatar
        name="Alice Johnson"
        source={{ uri: 'https://invalid.example/avatar.png' }}
        size={64}
      />,
    );
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    const root = screen.getByLabelText('Alice Johnson');
    const widthBefore = root.style.width;
    const heightBefore = root.style.height;
    expect(widthBefore).toBe('64px');
    expect(heightBefore).toBe('64px');

    fireEvent.error(img!);

    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('AJ')).toBeInTheDocument();
    expect(root.style.width).toBe(widthBefore);
    expect(root.style.height).toBe(heightBefore);
  });

  it('renders a one-word name as a single initial', () => {
    render(<Avatar name="Madonna" />);
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('renders an empty name as the "?" placeholder', () => {
    render(<Avatar name="" />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('exposes the name as the accessibility label on the container', () => {
    render(
      <Avatar
        name="Alice Johnson"
        source={{ uri: 'https://example.com/avatar.png' }}
      />,
    );
    expect(screen.getByLabelText('Alice Johnson')).toBeInTheDocument();
  });
});
