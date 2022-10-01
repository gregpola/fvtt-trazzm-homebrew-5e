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

    static private final String _tokenPrefix = "tokenizer/npc-images/";
    static private final Path _searchPath = Paths.get("assets/monsters");
    static private final String _imageFilePrefix = "npc-token-";

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
            boolean found = false;

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

            // create a need to fix file
            File fixFile = new File(selectedFile.getParentFile(), "fixes-" + selectedFile.getName() + ".txt");
            if (fixFile.exists()) {
                fixFile.delete();
            }
            try {
                fixFile.createNewFile();
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
                        JsonObject tokenObject = jsonObject.getAsJsonObject("token");
                        JsonPrimitive nameObj = tokenObject.getAsJsonPrimitive("name");
                        JsonPrimitive imageObj = tokenObject.getAsJsonPrimitive("img");
                        Path updatedPath = findImage(imageObj.getAsString());

                        if (updatedPath != null) {
                            String newPath = updatedPath.toString().replaceAll("\\\\", "/");
                            tokenObject.addProperty("img", newPath);
                            tokenObject.addProperty("vision", true);
                            String monster = _gson.toJson(jsonObject);
                            writer.write(monster);
                            writer.write("\r\n");
                        }
                        else {
                            System.out.println("No token found for: " + nameObj.getAsString());
                            // still fix the vision
                            tokenObject.addProperty("vision", true);
                            String monster = _gson.toJson(jsonObject);
                            writer.write(monster);
                            writer.write("\r\n");
                            fixWriter.write(nameObj.getAsString());
                            fixWriter.write("\r\n");
                        }
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

    // _tokenImagesPath
    private Path findImage(String oldImage) {
        if (!oldImage.toLowerCase().startsWith(_tokenPrefix))
            return null;

        String base = oldImage.substring(_tokenPrefix.length()).toLowerCase();

        // first check the name as is
        List<Path> results = null;
        String name = base.substring(0, base.indexOf("."));
        try {
            results = findByFileName(name + ".webp");
        } catch (IOException e) {
            log.append("Exception: " + e.getMessage() + newline);
            log.setCaretPosition(log.getDocument().getLength());
        }

        if ((results != null) && !results.isEmpty()) {
            log.append("Found a match: " + results.get(0) + newline);
            log.setCaretPosition(log.getDocument().getLength());
            return results.get(0);
        }

        // try adding our typical file prefix
        String name2 = _imageFilePrefix + name;
        try {
            results = findByFileName(name2 + ".webp");
        } catch (IOException e) {
            log.append("Exception: " + e.getMessage() + newline);
            log.setCaretPosition(log.getDocument().getLength());
        }

        if ((results != null) && !results.isEmpty()) {
            log.append("Found a match: " + results.get(0) + newline);
            log.setCaretPosition(log.getDocument().getLength());
            return results.get(0);
        }

        // try by replacing underscores with dashes
        String name3 = _imageFilePrefix + name.replaceAll("_", "-");
        try {
            results = findByFileName(name3 + ".webp");
        } catch (IOException e) {
            log.append("Exception: " + e.getMessage() + newline);
            log.setCaretPosition(log.getDocument().getLength());
        }

        if ((results != null) && !results.isEmpty()) {
            log.append("Found a match: " + results.get(0) + newline);
            log.setCaretPosition(log.getDocument().getLength());
            return results.get(0);
        }

        // finally, just try by the base name, this will be a fallback option
        if (name.contains("_")) {
            String name4 = _imageFilePrefix + name.substring(0, name.indexOf("_"));
            try {
                results = findByFileName(name4 + ".webp");
            } catch (IOException e) {
                log.append("Exception: " + e.getMessage() + newline);
                log.setCaretPosition(log.getDocument().getLength());
            }

            if ((results != null) && !results.isEmpty()) {
                log.append("Found a match: " + results.get(0) + newline);
                log.setCaretPosition(log.getDocument().getLength());
                return results.get(0);
            }
        }

        // no image found
        return null;
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
        JFrame frame = new JFrame("RemoveDamageFlavor");
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
