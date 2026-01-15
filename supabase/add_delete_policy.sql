-- Allow users to delete matches they are part of (for cleanup)
create policy "Users can delete matches they are part of"
on matches for delete
using (auth.uid() = player1_id or auth.uid() = player2_id);
