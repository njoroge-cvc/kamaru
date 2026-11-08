"""Several staff roles per person; official documents library

Revision ID: b9d1f3a5c7e8
Revises: a7c9e1f3b5d4
Create Date: 2026-11-08

Additive: one user column (filled from each person's current role), one new table.
"""
from alembic import op
import sqlalchemy as sa


revision = 'b9d1f3a5c7e8'
down_revision = 'a7c9e1f3b5d4'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('staff_roles', sa.String(length=120), nullable=False, server_default=''))
    # Everyone keeps exactly the access they have today
    op.execute("UPDATE \"user\" SET staff_roles = role WHERE role IS NOT NULL AND role <> 'member'")

    op.create_table(
        'document',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(length=20), nullable=False, server_default='other'),
        sa.Column('season_id', sa.Integer(), nullable=True),
        sa.Column('public_id', sa.String(length=300), nullable=False),
        sa.Column('file_name', sa.String(length=255), nullable=False),
        sa.Column('file_ext', sa.String(length=10), nullable=False),
        sa.Column('size_bytes', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('uploaded_by_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['season_id'], ['season.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['uploaded_by_id'], ['user.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_document_season_id', 'document', ['season_id'], unique=False)


def downgrade():
    op.drop_index('ix_document_season_id', table_name='document')
    op.drop_table('document')
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('staff_roles')
