"""Newsletter: unsubscribe links, confirmation tracking, send log

Revision ID: f1b3d5e7a9c2
Revises: e5a7c9b1d3f2
Create Date: 2026-11-08

Additive: three nullable subscriber columns, one new table; every existing subscriber
gets an unsubscribe token when first emailed. No rows are deleted or changed otherwise.
"""
from alembic import op
import sqlalchemy as sa


revision = 'f1b3d5e7a9c2'
down_revision = 'e5a7c9b1d3f2'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('newsletter_subscriber', schema=None) as batch_op:
        batch_op.add_column(sa.Column('unsubscribe_token', sa.String(length=64), nullable=True))
        batch_op.add_column(sa.Column('unsubscribed_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('last_confirmation_sent_at', sa.DateTime(), nullable=True))
        batch_op.create_unique_constraint('uq_newsletter_subscriber_unsubscribe_token', ['unsubscribe_token'])

    # Unsubscribe tokens are created by the app the first time a subscriber is emailed.

    op.create_table(
        'newsletter_send',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('subject', sa.String(length=255), nullable=False),
        sa.Column('blog_post_id', sa.Integer(), nullable=True),
        sa.Column('kind', sa.String(length=20), nullable=False, server_default='blog'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='sending'),
        sa.Column('recipients', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('delivered', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('failed', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('sent_by_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('finished_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['blog_post_id'], ['blog_post.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['sent_by_id'], ['user.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_newsletter_send_blog_post_id', 'newsletter_send', ['blog_post_id'], unique=False)


def downgrade():
    op.drop_index('ix_newsletter_send_blog_post_id', table_name='newsletter_send')
    op.drop_table('newsletter_send')
    with op.batch_alter_table('newsletter_subscriber', schema=None) as batch_op:
        batch_op.drop_constraint('uq_newsletter_subscriber_unsubscribe_token', type_='unique')
        batch_op.drop_column('last_confirmation_sent_at')
        batch_op.drop_column('unsubscribed_at')
        batch_op.drop_column('unsubscribe_token')
