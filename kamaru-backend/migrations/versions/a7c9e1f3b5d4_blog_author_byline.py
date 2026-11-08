"""Blog: author byline (name, profession/niche, organisation)

Revision ID: a7c9e1f3b5d4
Revises: f1b3d5e7a9c2
Create Date: 2026-11-08

Additive only: three nullable columns.
"""
from alembic import op
import sqlalchemy as sa


revision = 'a7c9e1f3b5d4'
down_revision = 'f1b3d5e7a9c2'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('blog_post', schema=None) as batch_op:
        batch_op.add_column(sa.Column('author_name', sa.String(length=120), nullable=True))
        batch_op.add_column(sa.Column('author_title', sa.String(length=120), nullable=True))
        batch_op.add_column(sa.Column('author_org', sa.String(length=160), nullable=True))


def downgrade():
    with op.batch_alter_table('blog_post', schema=None) as batch_op:
        batch_op.drop_column('author_org')
        batch_op.drop_column('author_title')
        batch_op.drop_column('author_name')
