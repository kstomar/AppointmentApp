class CreateActiveAdminComments < ActiveRecord::Migration[7.1]
  def change
    create_table :active_admin_comments, id: :uuid do |t|
      t.string :namespace
      t.text :body
      t.references :resource, polymorphic: true, type: :uuid
      t.references :author, polymorphic: true, type: :uuid

      t.timestamps
    end

    add_index :active_admin_comments, [:namespace]
  end
end
