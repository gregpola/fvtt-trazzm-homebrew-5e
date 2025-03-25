Dialog.confirm({
  title: 'Bulk token configuration',
  content: '<p>This tool will update all <strong>Unlinked Tokens</strong> on <strong>All Scenes</strong> to the following settings:</p>' +
    '<form>' +
    '<div class="form-group"><label for="displayName">Display Name</label>' +
      '<select id="displayName" name="displayName" data-dtype="Number">' +
      '<option value="0">Never Displayed</option><option value="10">When Controlled</option><option value="20" selected>Hovered by Owner</option><option value="30">Hovered by Anyone</option><option value="40">Always for Owner</option><option value="50">Always for Everyone</option>' +
      '</select>' +
    '</div>' +
    '<div class="form-group">' +
      '<label for="displayBars">Display Bars</label>' +
      '<select id="displayBars" name="displayBars" data-dtype="Number">' +
      '<option value="0">Never Displayed</option><option value="10">When Controlled</option><option value="20" selected>Hovered by Owner</option><option value="30">Hovered by Anyone</option><option value="40">Always for Owner</option><option value="50">Always for Everyone</option>' +
      '</select>' +
    '</div>' +
    '<div class="form-group">' +
    '<label for="vision">Has Vision</label>' +
    '<input type="checkbox" id="vision" name="vision">' +
    '</div>' +
    '</form>' +
    '<hr>',
  label: 'Update tokens',
  yes: async (html) => {
    let displayName = html.find('#displayName').val();
    let displayBars = html.find('#displayBars').val();
    let vision = html.find('#vision').is(':checked');
    const total = game.scenes.size;
    let count = 0;
    for (const scene of game.scenes) {
      const updates = scene.tokens.filter(token => !token.data.actorLink).map(token => {
        return {
          _id: token.id,
          displayName: parseInt(displayName),
          displayBars: parseInt(displayBars),
          vision: vision
        };
      });
      if (updates.length) {
        console.log(`Updating ${updates.length} tokens in ${scene.name}`);
        await scene.updateEmbeddedDocuments('Token', updates);
      }
      count++;
      const pct = Math.round(count / total * 100);
      SceneNavigation.displayProgressBar({label: `Updating scene tokens...`, pct});
    }
  },
});