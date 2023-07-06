import com.google.gson.*;

import javax.swing.*;
import java.awt.BorderLayout;
import java.awt.Insets;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class FixMonsterTokens extends JPanel implements ActionListener {

    static {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    static private final Path currentRelativePath = Paths.get("");

    static private final String newline = "\n";

    //static private final String _tokenPrefix = "tokenizer/npc-images/";
    static private final Path _searchPath = Paths.get("assets/monsters");
    //static private final String _imageFilePrefix = "npc-token-";

    static private final String _moduleAssetPrefix = "modules/fvtt-trazzm-homebrew-5e/";

    static private final Gson _gson = new Gson();

    private final JButton openButton;
    private final JButton replaceButton;
    private final JTextArea log;

    private final JFileChooser fileChooser;

    private File selectedFile;

    public FixMonsterTokens() {
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
        replaceButton = new JButton("Repair Monsters");
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
            int returnVal = fileChooser.showOpenDialog(FixMonsterTokens.this);

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
            log.append("Starting token repair..." + newline);
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

            // create a need to fix file
            File fixFile = new File(selectedFile.getParentFile(), "fixes-" + selectedFile.getName() + ".txt");
            if (fixFile.exists()) {
                if (!fixFile.delete()) {
                    System.err.println("Unable to delete the old unfixed file");
                }
            }
            try {
                if (!fixFile.createNewFile()) {
                    System.err.println("Unable to create the new unfixed file");
                }
            } catch (IOException ex) {
                throw new RuntimeException(ex);
            }

            try (BufferedReader reader = new BufferedReader(new FileReader(selectedFile));
                 BufferedWriter writer = new BufferedWriter(new FileWriter(newFile));
                 BufferedWriter fixWriter = new BufferedWriter(new FileWriter(fixFile))) {

                String currentLine;
                while ((currentLine = reader.readLine()) != null) {
                    //System.out.println(currentLine);
                    try {
                        JsonElement jsonElement = JsonParser.parseString(currentLine);
                        JsonObject jsonObject = jsonElement.getAsJsonObject();
                        JsonObject tokenObject = jsonObject.getAsJsonObject("prototypeToken");
                        JsonPrimitive nameObj = tokenObject.getAsJsonPrimitive("name");
                        JsonObject textureObject = tokenObject.getAsJsonObject("texture");
                        JsonPrimitive tokenImageObj = textureObject.getAsJsonPrimitive("src");
                        JsonPrimitive portraitObj = jsonObject.getAsJsonPrimitive("img");

                        // repair those pointing to the tokenizer
                        String tokenPath = tokenImageObj.getAsString();
                        if (tokenPath.startsWith(_moduleAssetPrefix)) {
                            tokenPath = tokenPath.substring(_moduleAssetPrefix.length());
                        }
                        File tokenImageFile = new File(tokenPath);

                        if (tokenPath.isBlank() || !tokenImageFile.exists()) {
                            System.out.println("No token found for: '" + nameObj.getAsString() + "' using the portrait");
                            // just use the portrait image
                            String portraitPath = portraitObj.getAsString();
                            if ((portraitPath != null ) && !portraitPath.isBlank()) {
                                textureObject.addProperty("src", portraitPath);

                            }
                            else {
                                fixWriter.write(nameObj.getAsString());
                                fixWriter.write("\r\n");
                            }
                        }

                        // Write out the entry
                        String monster = _gson.toJson(jsonObject);
                        writer.write(monster);
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

    private List<Path> findByFileName(String fileName) throws IOException {
        List<Path> result;
        try (Stream<Path> pathStream = Files.find(_searchPath, Integer.MAX_VALUE,
                (p, basicFileAttributes) -> p.getFileName().toString().equalsIgnoreCase(fileName)) ) {
            result = pathStream.collect(Collectors.toList());
        }

        return result;
    }

    /**
     * Create the GUI and show it.  For thread safety,
     * this method should be invoked from the
     * event dispatch thread.
     */
    private static void createAndShowGUI() {
        //Create and set up the window.
        JFrame frame = new JFrame("Fix Monster Tokens");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);

        //Add content to the window.
        frame.add(new FixMonsterTokens());

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
