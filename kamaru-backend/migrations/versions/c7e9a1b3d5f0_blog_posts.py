"""Blog posts about Kikuyu culture

Revision ID: c7e9a1b3d5f0
Revises: b4d6f8a0c2e1
Create Date: 2026-11-07

Additive only: creates one new table, existing data is untouched.
"""
from alembic import op
import sqlalchemy as sa


revision = 'c7e9a1b3d5f0'
down_revision = 'b4d6f8a0c2e1'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'blog_post',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('excerpt', sa.Text(), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('cover_image_url', sa.String(length=500), nullable=True),
        sa.Column('published', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('published_at', sa.DateTime(), nullable=True),
        sa.Column('author_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['author_id'], ['user.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_blog_post_slug', 'blog_post', ['slug'], unique=True)


def downgrade():
    op.drop_index('ix_blog_post_slug', table_name='blog_post')
    op.drop_table('blog_post')
