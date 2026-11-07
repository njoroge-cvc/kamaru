"""Gallery photos can belong to a season

Revision ID: d2f4a6b8c0e3
Revises: c7e9a1b3d5f0
Create Date: 2026-11-08

Additive only: one nullable column, an index and a foreign key. Existing photos stay unassigned.
"""
from alembic import op
import sqlalchemy as sa


revision = 'd2f4a6b8c0e3'
down_revision = 'c7e9a1b3d5f0'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('gallery', schema=None) as batch_op:
        batch_op.add_column(sa.Column('season_id', sa.Integer(), nullable=True))
        batch_op.create_index('ix_gallery_season_id', ['season_id'], unique=False)
        batch_op.create_foreign_key('fk_gallery_season_id', 'season', ['season_id'], ['id'], ondelete='SET NULL')


def downgrade():
    with op.batch_alter_table('gallery', schema=None) as batch_op:
        batch_op.drop_constraint('fk_gallery_season_id', type_='foreignkey')
        batch_op.drop_index('ix_gallery_season_id')
        batch_op.drop_column('season_id')
