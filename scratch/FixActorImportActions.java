import com.google.gson.*;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;

public class FixActorImportActions extends JPanel implements ActionListener {

    static {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    static private final Path currentRelativePath = Paths.get("");

    static private final String newline = "\n";

    static private final Gson _gson = new Gson();

    private final JButton openButton, replaceButton;
    private final JTextArea log;

    private final JFileChooser fileChooser;

    private File selectedFile;

    public FixActorImportActions() {
        super(new BorderLayout());

        //Create the log first, because the action listeners
        //need to refer to it.
        log = new JTextArea(5,20);
        log.setMargin(new Insets(5,5,5,5));
        log.setEditable(false);
        JScrollPane logScrollPane = new JScrollPane(log);

        // Create a file chooser
        fileChooser = new JFileChooser(currentRelativePath.toAbsolutePath().toString());
        openButton = new JButton("Open a File...");
        openButton.addActionListener(this);

        //Create the save button.  We use the image from the JLF
        //Graphics Repository (but we extracted it from the jar).
        replaceButton = new JButton("Repair Imported Actions");
        replaceButton.addActionListener(this);
        replaceButton.setEnabled(false);

        //For layout purposes, put the buttons in a separate panel
        JPanel buttonPanel = new JPanel(); //use FlowLayout
        buttonPanel.add(openButton);
        buttonPanel.add(replaceButton);

        //Add the buttons and the log to this panel.
        add(buttonPanel, BorderLayout.PAGE_START);
        add(logScrollPane, BorderLayout.CENTER);
    }

    public void actionPerformed(ActionEvent e) {

        //Handle open button action.
        if (e.getSource() == openButton) {
            int returnVal = fileChooser.showOpenDialog(FixActorImportActions.this);

            if (returnVal == JFileChooser.APPROVE_OPTION) {
                replaceButton.setEnabled(false);
                selectedFile = fileChooser.getSelectedFile();
                log.append("Opening: " + selectedFile.getName() + "." + newline);
                log.setCaretPosition(log.getDocument().getLength());
                replaceButton.setEnabled(selectedFile != null);

            } else {
                log.append("Open command cancelled by user." + newline);
                log.setCaretPosition(log.getDocument().getLength());
            }

            //Handle replace button action.
        } else if (e.getSource() == replaceButton) {
            log.append("Starting import repairs..." + newline);
            log.setCaretPosition(log.getDocument().getLength());

            // create the new file
            File newFile = new File(selectedFile.getParentFile(), "f-" + selectedFile.getName());
            if (newFile.exists()) {
                newFile.delete();
            }
            try {
                newFile.createNewFile();
            } catch (IOException ex) {
                throw new RuntimeException(ex);
            }

            try (BufferedReader reader = new BufferedReader(new FileReader(selectedFile));
                 BufferedWriter writer = new BufferedWriter(new FileWriter(newFile))) {

                String currentLine;
                while ((currentLine = reader.readLine()) != null) {
                    //System.out.println(currentLine);
                    try {
                        JsonElement jsonElement = JsonParser.parseString(currentLine);
                        JsonObject jsonObject = jsonElement.getAsJsonObject();
                        JsonArray actorItems = jsonObject.getAsJsonArray("items");

                        if ( (actorItems != null) && !actorItems.isEmpty()) {
                            for (JsonElement element : actorItems) {
                                if (element.isJsonObject()) {
                                    JsonObject itemObject = element.getAsJsonObject();
                                    JsonPrimitive typeObject = itemObject.getAsJsonPrimitive("type");
                                    String itemType = typeObject.getAsString();

                                    if (itemType.equals("weapon")) {
                                        // get rid of the ddbimporter and monsterMunch flags
                                        JsonObject flagsObject = itemObject.getAsJsonObject("flags");
                                        if (flagsObject != null) {
                                            flagsObject.remove("ddbimporter");
                                            flagsObject.remove("monsterMunch");
                                        }

                                        JsonObject systemObject = itemObject.getAsJsonObject("system");
                                        if (systemObject != null) {
                                            // fix the targeting
                                            JsonObject targetObject = systemObject.getAsJsonObject("target");
                                            if (targetObject != null) {
                                                int targetCount = 0;
                                                JsonElement targetValueElement = targetObject.get("value");
                                                if ((targetValueElement != null) && targetValueElement.isJsonPrimitive()) {
                                                    targetCount = targetValueElement.getAsJsonPrimitive().getAsInt();
                                                }

                                                String targetUnits = "";
                                                JsonElement targetUnitsElement = targetObject.get("units");
                                                if ((targetUnitsElement != null) && targetUnitsElement.isJsonPrimitive()) {
                                                    targetUnits = targetUnitsElement.getAsJsonPrimitive().getAsString();
                                                }

                                                String targetType = "";
                                                JsonElement targetTypeElement = targetObject.get("type");
                                                if ((targetTypeElement != null) && targetTypeElement.isJsonPrimitive()) {
                                                    targetType = targetTypeElement.getAsJsonPrimitive().getAsString();
                                                }

                                                if ((targetCount == 0) && targetUnits.isBlank() && targetType.isBlank()) {
                                                    targetObject.addProperty("value", 1);
                                                    targetObject.addProperty("type", "creature");
                                                }
                                            }

                                            // fix the uses
                                            JsonObject usesObject = systemObject.getAsJsonObject("uses");
                                            if (usesObject != null) {
                                                int usesValue = 0;
                                                JsonElement usesValueElement = usesObject.get("value");
                                                if ((usesValueElement != null) && usesValueElement.isJsonPrimitive()) {
                                                    usesValue = usesValueElement.getAsJsonPrimitive().getAsInt();
                                                }

                                                if (usesValue == 0) {
                                                    usesObject.add("value", JsonNull.INSTANCE);
                                                }
                                            }

                                            // fix the reach flag
                                            JsonObject descriptionObject = systemObject.getAsJsonObject("description");
                                            if (descriptionObject != null) {
                                                JsonPrimitive dValueObject = descriptionObject.getAsJsonPrimitive("value");
                                                String valueText = dValueObject.getAsString();
                                                int index = valueText.indexOf("reach");
                                                if (index > -1) {
                                                    String reachText = valueText.substring(index);
                                                    int unitIndex = reachText.indexOf("ft");
                                                    try {
                                                        String reachValueText = reachText.substring(5, unitIndex).trim();
                                                        int reach = Integer.parseInt(reachValueText);

                                                        if (reach < 10) {
                                                            JsonObject propertiesObject = systemObject.getAsJsonObject("properties");
                                                            if (propertiesObject != null) {
                                                                propertiesObject.addProperty("rch", false);
                                                            }
                                                        }
                                                    } catch (Exception nfe){
                                                        System.err.println(jsonObject.getAsJsonPrimitive("name").toString());
                                                        nfe.printStackTrace(System.err);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Write out the creature
                        String creature = _gson.toJson(jsonObject);
                        writer.write(creature);
                        writer.write("\r\n");

                    }
                    catch (Exception jse) {
                        jse.printStackTrace(System.err);
                    }
                }

            } catch (Exception ex) {
                ex.printStackTrace(System.err);
                log.append("Exception: " + ex.getMessage() + newline);
                log.setCaretPosition(log.getDocument().getLength());
            }

            log.append("Finished replacements" + newline);
            log.setCaretPosition(log.getDocument().getLength());
        }
    }

    /**
     * Create the GUI and show it.  For thread safety,
     * this method should be invoked from the
     * event dispatch thread.
     */
    private static void createAndShowGUI() {
        //Create and set up the window.
        JFrame frame = new JFrame("RemoveDamageFlavor");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        //Add content to the window.
        frame.add(new FixActorImportActions());

        //Display the window.
        frame.pack();
        frame.setSize(800, 600);
        frame.setLocationRelativeTo(null);
        frame.setVisible(true);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            UIManager.put("swing.boldMetal", Boolean.FALSE);
            createAndShowGUI();
        });
    }
}