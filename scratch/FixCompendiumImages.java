import com.google.gson.*;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.*;
import java.nio.file.Path;
import java.nio.file.Paths;

public class FixCompendiumImages extends JPanel implements ActionListener {

    static {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    static private final String _badTokenPrefix = "systems/dnd5e/";
    static private final String _defaultItemImage = "icons/magic/symbols/question-stone-yellow.webp";


    static private final Path currentRelativePath = Paths.get("");

    static private final String newline = "\n";

    static private final Gson _gson = new Gson();

    private final JButton openButton;
    private final JButton replaceButton;
    private final JTextArea log;

    private final JFileChooser fileChooser;

    private File selectedFile;

    public FixCompendiumImages() {
        super(new BorderLayout());

        //Create the log first, because the action listeners
        //need to refer to it.
        log = new JTextArea(5, 20);
        log.setMargin(new Insets(5, 5, 5, 5));
        log.setEditable(false);
        JScrollPane logScrollPane = new JScrollPane(log);

        // Create a file chooser
        fileChooser = new JFileChooser(currentRelativePath.toAbsolutePath().toString());
        openButton = new JButton("Open a File...");
        openButton.addActionListener(this);

        //Create the save button.  We use the image from the JLF
        //Graphics Repository (but we extracted it from the jar).
        replaceButton = new JButton("Repair Missing Images");
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
            int returnVal = fileChooser.showOpenDialog(FixCompendiumImages.this);

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
            log.append("Starting image repair..." + newline);
            log.setCaretPosition(log.getDocument().getLength());

            // create the new file
            File newFile = new File(selectedFile.getParentFile(), "f-" + selectedFile.getName());
            if (newFile.exists()) {
                if (!newFile.delete()) {
                    System.err.println("Unable to delete the old f- file");
                }
            }
            try {
                if (!newFile.createNewFile()) {
                    System.err.println("Unable to create the new f- file");
                }
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
                        JsonPrimitive imageObj = jsonObject.getAsJsonPrimitive("img");

                        // only repair items that reference the old dnd5e path
                        String tokenPath = imageObj.getAsString();
                        if (tokenPath.toLowerCase().startsWith(_badTokenPrefix) || tokenPath.isBlank()) {
                            jsonObject.addProperty("img", _defaultItemImage);
                        }

                        // Write out the entry
                        String spell = _gson.toJson(jsonObject);
                        writer.write(spell);
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
        JFrame frame = new JFrame("Fix Compendium Images");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        //Add content to the window.FixCantrips
        frame.add(new FixCompendiumImages());

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
