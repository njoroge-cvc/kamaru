"""Add user roles (RBAC) and season registration window

Revision ID: a1c3e5f7b9d2
Revises: fc123f82d833
Create Date: 2026-11-07

"""
from alembic import op
import sqlalchemy as sa


revision = 'a1c3e5f7b9d2'
down_revision = 'fc123f82d833'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('role', sa.String(length=20), nullable=False, server_default='member'))

    # Existing admins keep full access
    op.execute("UPDATE \"user\" SET role = 'admin' WHERE is_admin = TRUE")

    with op.batch_alter_table('season', schema=None) as batch_op:
        batch_op.add_column(sa.Column('registration_open', sa.Boolean(), nullable=False, server_default=sa.false()))
        batch_op.add_column(sa.Column('registration_closes_at', sa.DateTime(), nullable=True))

    # Preserve today's behaviour: the active season was accepting registrations
    op.execute("UPDATE season SET registration_open = TRUE WHERE is_active = TRUE")


def downgrade():
    with op.batch_alter_table('season', schema=None) as batch_op:
        batch_op.drop_column('registration_closes_at')
        batch_op.drop_column('registration_open')

    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('role')
