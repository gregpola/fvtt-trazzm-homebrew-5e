import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.*;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

public class RemoveDamageFlavor extends JPanel implements ActionListener {

    static {
        try {
            UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static String[] damageTypes = {"[acid]","[bludgeoning]","[cold]","[fire]","[force]","[lightning]","[necrotic]","[piercing]","[physical]","[poison]","[psychic]","[radiant]","[slashing]","[thunder]"};
    static private final String newline = "\n";
    static private final Charset _charset = StandardCharsets.UTF_8;

    private JButton openButton, replaceButton;
    private JTextArea log;

    private JFileChooser fileChooser;

    private File selectedFile;
    private String fileContent;

    public RemoveDamageFlavor() {
        super(new BorderLayout());

        //Create the log first, because the action listeners
        //need to refer to it.
        log = new JTextArea(5,20);
        log.setMargin(new Insets(5,5,5,5));
        log.setEditable(false);
        JScrollPane logScrollPane = new JScrollPane(log);

        // Create a file chooser
        fileChooser = new JFileChooser();
        openButton = new JButton("Open a File...");
        openButton.addActionListener(this);

        //Create the save button.  We use the image from the JLF
        //Graphics Repository (but we extracted it from the jar).
        replaceButton = new JButton("Replace Flavors");
        replaceButton.addActionListener(this);
        replaceButton.setEnabled(false);

        //For layout purposes, put the buttons in a separate panel
        JPanel buttonPanel = new JPanel(); //use FlowLayout
        buttonPanel.add(openButton);
        buttonPanel.add(replaceButton);

        //Add the buttons and the log to this panel.
        add(buttonPanel, BorderLayout.PAGE_START);
        add(logScrollPane, BorderLayout.CENTER);

        setSize(400, 400);
        setLocation(400, 400);

    }

    public void actionPerformed(ActionEvent e) {

        //Handle open button action.
        if (e.getSource() == openButton) {
            int returnVal = fileChooser.showOpenDialog(RemoveDamageFlavor.this);

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
            log.append("Starting flavor replacement..." + newline);
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

            try (BufferedReader reader = new BufferedReader(new FileReader(selectedFile));
                 BufferedWriter writer = new BufferedWriter(new FileWriter(newFile))) {

                String currentLine;
                while ((currentLine = reader.readLine()) != null) {
                    System.out.println(currentLine);
                    for (String flavor : damageTypes) {
                        if (currentLine.contains(flavor)) {
                            log.append(String.format("Found '%s' in the file, replacing it...", flavor) + newline);
                            log.setCaretPosition(log.getDocument().getLength());
                            currentLine = removeAll(currentLine, flavor);
                            System.out.println(currentLine);
                        }
                        else {
                        }
                    }

                    writer.write(currentLine);
                    writer.write("\r\n");
                }
            }
            catch (Exception ex) {
                ex.printStackTrace(System.err);
                log.append("Exception: " + ex.getMessage() + newline);
                log.setCaretPosition(log.getDocument().getLength());
            }

            log.append("Finished replacements" + newline);
            log.setCaretPosition(log.getDocument().getLength());
        }
    }

    private String removeAll(String original, String textToRemove) {
        // sanity checks
        if ((original == null) || original.isBlank() || (textToRemove == null) || textToRemove.isBlank() || !original.contains(textToRemove))
            return original;

        StringBuilder stringBuilder = new StringBuilder();
        int index = original.indexOf(textToRemove);
        int pos = 0;
        while (index > -1) {
            String chunk = original.substring(pos, index);
            stringBuilder.append(chunk);
            pos = (index + textToRemove.length());
            index = original.indexOf(textToRemove, pos);
        }

        // add in the last chunk
        stringBuilder.append(original.substring(pos));

        return stringBuilder.toString();
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
        frame.add(new RemoveDamageFlavor());

        //Display the window.
        frame.pack();
        frame.setVisible(true);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            UIManager.put("swing.boldMetal", Boolean.FALSE);
            createAndShowGUI();
        });
    }

    /*
    public static void main(String[] args) throws IOException {
        String filepath = "";
        if ((args != null) && (args.length > 0) ) {
            filepath = args[0];
        }
        else {
            fileChooser.showOpenDialog()

        }

        if ((filepath != null) && !filepath.isEmpty()) {
            // read the file
            Path path = Paths.get(filepath);
            Charset charset = StandardCharsets.UTF_8;
            String content = Files.readString(path, charset);

            content = content.replaceAll("foo", "bar");
            Files.writeString(path, content, charset);
        }
    }
    */
}